import { CfnJson, CfnOutput, Duration } from 'aws-cdk-lib';
import { ISubnet, IVpc, InstanceType } from 'aws-cdk-lib/aws-ec2';
import { Cluster, HelmChart } from 'aws-cdk-lib/aws-eks';
import { CfnInstanceProfile, ManagedPolicy, OpenIdConnectPrincipal, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { TagSubnetsCustomResource } from './custom-resource';

export interface KarpenterProps {
  /**
   * The Cluster on which Karpenter needs to be added
   */
  readonly cluster: Cluster;

  /**
   * VPC
   */
  readonly vpc: IVpc;

  /**
   * The VPC subnets which need to be tagged for Karpenter to find them.
   * If left blank it will private VPC subnets will be selected by default.
   */
  readonly subnets?: ISubnet[];

  /**
   * Default provisioner customization
   */
  readonly provisionerConfig?: ProvisionerProps;

  /**
   * Tags will be added to every EC2 instance launched by the default provisioner
   */
  readonly tags?: {[key: string]: string};
}

export interface ProvisionerProps {
  /**
   * Time in seconds in which ndoes will expire and get replaced
   * i.e. Duration.hours(12)
   * @default 2592000
   */
  readonly ttlSecondsUntilExpired?: Duration;

  /**
   * Time in seconds in which nodes will scale down due to low utilization
   * i.e. Duration.minutes(30)
   * @default 30
   */
  readonly ttlSecondsAfterEmpty?: Duration;

  /**
   * The instance types to use in the default Karpenter provider.
   * @default t3.medium
   */
  readonly instanceTypes?: InstanceType[];

  /**
   * Capacity type of the node instances
   * @default spot
   */
  readonly capacityTypes?: CapacityType[];

  /**
   * Architecture type of the node instances
   * @default amd64
   */
  readonly archTypes?: ArchType[];
}

export enum CapacityType {
  /**
   * Spot capacity
   */
  SPOT='spot',

  /**
   * On demand capacity
   */
  ON_DEMAND='on-demand',
}

export enum ArchType {
  /**
   * ARM based instances
   */
  ARM64='arm64',

  /**
   * x86 based instances
   */
  AMD64='amd64',
}

/**
 * This construct adds Karpenter to an existing EKS cluster following the guide: https://karpenter.sh/docs/getting-started/
 * It creates two IAM roles and then adds and configures Karpenter on the cluster with a default provisioner. Additionally,
 * it tags subnets with custom tags that is used for instructing Karpenter where to place the nodes.
 */
export class Karpenter extends Construct {
  public readonly karpenterNodeRole: Role;
  public readonly karpenterControllerRole: Role;
  public readonly karpenterHelmChart: HelmChart;

  constructor(scope: Construct, id: string, props: KarpenterProps) {
    super(scope, id);

    const subnets = props.subnets ? props.subnets : props.vpc.privateSubnets;
    const ttlSecondsUntilExpired = props.provisionerConfig?.ttlSecondsUntilExpired?.toSeconds() ?? Duration.days(30).toSeconds();
    const ttlSecondsAfterEmpty = props.provisionerConfig?.ttlSecondsAfterEmpty?.toSeconds() ?? Duration.seconds(30).toSeconds();
    const archTypes = props.provisionerConfig?.archTypes ?? [ArchType.AMD64];
    const capacityTypes = props.provisionerConfig?.capacityTypes ?? [CapacityType.SPOT];
    const instanceTypes = props.provisionerConfig?.instanceTypes?.map((i)=> { return i.toString(); }) ?? ['t3a.medium'];
    const customTags = props.tags ? {
      tags: {
        ...props.tags,
      },
    } : undefined;

    // Custom resource to tag vpc subnets with
    new TagSubnetsCustomResource(this, 'TagSubnets', {
      subnets: subnets.map((subnet) => { return subnet.subnetId; }),
      clusterTag: `karpenter.sh/discovery/${props.cluster.clusterName}`,
    });

    const karpenterControllerPolicy = new ManagedPolicy(this, 'ControllerPolicy', {
      statements: [
        new PolicyStatement({
          actions: [
            // Write Operations
            'ec2:CreateLaunchTemplate',
            'ec2:CreateFleet',
            'ec2:RunInstances',
            'ec2:CreateTags',
            'iam:PassRole',
            'ec2:TerminateInstances',
            'ec2:DeleteLaunchTemplate',
            // Read Operations
            'ec2:DescribeLaunchTemplates',
            'ec2:DescribeInstances',
            'ec2:DescribeSecurityGroups',
            'ec2:DescribeSubnets',
            'ec2:DescribeInstanceTypes',
            'ec2:DescribeInstanceTypeOfferings',
            'ec2:DescribeAvailabilityZones',
            'ssm:GetParameter',
          ],
          resources: ['*'],
        }),
      ],
    });

    this.karpenterNodeRole = new Role(this, 'NodeRole', {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
      description: `This is the IAM role Karpenter uses to give compute permissions for ${props.cluster.clusterName}`,
    });

    [
      'AmazonEKS_CNI_Policy',
      'AmazonEKSWorkerNodePolicy',
      'AmazonEC2ContainerRegistryReadOnly',
      'AmazonSSMManagedInstanceCore',
    ].forEach((policyName) => {
      this.karpenterNodeRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName(policyName));
    });

    const instanceProfile = new CfnInstanceProfile(this, 'InstanceProfile', {
      roles: [this.karpenterNodeRole.roleName],
      instanceProfileName: `KarpenterNodeInstanceProfile-${props.cluster.clusterName}`,
      path: '/',
    });

    props.cluster.awsAuth.addRoleMapping(this.karpenterNodeRole, {
      groups: [
        'system:bootstrappers',
        'system:nodes',
      ],
      username: 'system:node:{{EC2PrivateDNSName}}',
    });

    const conditions = new CfnJson(this, 'ConditionPlainJson', {
      value: {
        [`${props.cluster.openIdConnectProvider.openIdConnectProviderIssuer}:aud`]: 'sts.amazonaws.com',
        [`${props.cluster.openIdConnectProvider.openIdConnectProviderIssuer}:sub`]: 'system:serviceaccount:karpenter:karpenter',
      },
    });

    const principal = new OpenIdConnectPrincipal(
      props.cluster.openIdConnectProvider,
    ).withConditions({
      StringEquals: conditions,
    });

    this.karpenterControllerRole = new Role(this, 'ControllerRole', {
      assumedBy: principal,
      description: `This is the IAM role Karpenter uses to allocate compute for ${props.cluster.clusterName}`,
    });
    this.karpenterControllerRole.addManagedPolicy(karpenterControllerPolicy);

    this.karpenterHelmChart = new HelmChart(this, 'HelmChart', {
      chart: 'karpenter',
      createNamespace: true,
      version: '0.6.3',
      cluster: props.cluster,
      namespace: 'karpenter',
      release: 'karpenter',
      repository: 'https://charts.karpenter.sh',
      timeout: Duration.minutes(15),
      wait: true,
      values: {
        clusterName: props.cluster.clusterName,
        clusterEndpoint: props.cluster.clusterEndpoint,
        serviceAccount: {
          annotations: {
            'eks.amazonaws.com/role-arn': this.karpenterControllerRole.roleArn,
          },
        },
        aws: {
          defaultInstanceProfile: instanceProfile.instanceProfileName,
        },
      },
    });

    // default Provisioner
    const karpenterDefaultProvisioner = props.cluster.addManifest('karpenterDefaultProvisioner', {
      apiVersion: 'karpenter.sh/v1alpha5',
      kind: 'Provisioner',
      metadata: {
        name: 'default',
      },
      spec: {
        ttlSecondsUntilExpired,
        ttlSecondsAfterEmpty,
        requirements: [
          {
            key: 'karpenter.sh/capacity-type',
            operator: 'In',
            values: capacityTypes,
          },
          {
            key: 'kubernetes.io/arch',
            operator: 'In',
            values: archTypes,
          },
          {
            key: 'node.kubernetes.io/instance-type',
            operator: 'In',
            values: instanceTypes,
          },
          {
            key: 'topology.kubernetes.io/zone',
            operator: 'In',
            values: props.vpc.availabilityZones,
          },
        ],
        labels: {
          'cluster-name': props.cluster.clusterName,
        },
        provider: {
          subnetSelector: {
            [`karpenter.sh/discovery/${props.cluster.clusterName}`]: '*',
          },
          securityGroupSelector: {
            [`kubernetes.io/cluster/${props.cluster.clusterName}`]: 'owned',
          },
          instanceProfile: instanceProfile.instanceProfileName,
          ...customTags,
        },
      },
    });

    karpenterDefaultProvisioner.node.addDependency(this.karpenterHelmChart);

    new CfnOutput(this, 'clusterName', { value: props.cluster.clusterName });
    new CfnOutput(this, 'karpenterControllerRole', { value: this.karpenterControllerRole.roleName });
    new CfnOutput(this, 'karpenterNodeRole', { value: this.karpenterNodeRole.roleName });
    new CfnOutput(this, 'instanceProfileName', { value: instanceProfile.instanceProfileName || '' });
    new CfnOutput(this, 'karpenterControllerPolicy', { value: karpenterControllerPolicy.managedPolicyName });
  }
}