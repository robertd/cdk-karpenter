import { CfnJson, CfnOutput, Duration } from 'aws-cdk-lib';
import { ISubnet, IVpc, InstanceType } from 'aws-cdk-lib/aws-ec2';
import { Cluster, HelmChart } from 'aws-cdk-lib/aws-eks';
import { CfnInstanceProfile, ManagedPolicy, OpenIdConnectPrincipal, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { TagSubnetsCustomResource } from './custom-resource';

export interface KarpenterProps {
  /**
   * The EKS cluster on which Karpenter is going to be installed on.
   */
  readonly cluster: Cluster;

  /**
   * VPC
   */
  readonly vpc: IVpc;

  /**
   * VPC subnets which need to be tagged for Karpenter to find them.
   * If left blank, private VPC subnets will be used and tagged by default.
   */
  readonly subnets?: ISubnet[];
}

export interface ProvisionerSpecs {
  /**
   * Time in seconds in which nodes will expire and get replaced.
   * If omitted, the feature is disabled and nodes will never expire.
   * i.e. Duration.days(7)
   */
  readonly ttlSecondsUntilExpired?: Duration;

  /**
   * Time in seconds in which nodes will scale down due to low utilization.
   * If omitted, the feature is disabled, nodes will never scale down due to low utilization
   */
  readonly ttlSecondsAfterEmpty?: Duration;

  /**
   * CPU and Memory Limits. Resource limits constrain the total size of the cluster.
   * Limits prevent Karpenter from creating new instances once the limit is exceeded.
   */
  readonly limits?: Limits;

  /**
   * Labels are arbitrary key-values that are applied to all nodes
   */
  readonly labels?: {[key: string]: string};

  /**
   * Provisioned nodes will have these taints. Taints may prevent pods from scheduling if they are not tolerated.
   */
  readonly taints?: Taints[];

  /**
   * Requirements that constrain the parameters of provisioned nodes.
   * These requirements are combined with pod.spec.affinity.nodeAffinity rules.
   */
  readonly requirements: ProvisionerReqs;

  /**
   * AWS cloud provider configuration
   */
  readonly provider?: ProviderConfig;
}

export interface ProvisionerReqs {
  /**
   * Instance types to be used by the Karpenter Provider.
   */
  readonly instanceTypes?: InstanceType[];

  /**
   * Instance types to be rejected by the Karpenter Provider.
   */
  readonly rejectInstanceTypes?: InstanceType[];

  /**
   * Capacity type of the node instances.
   */
  readonly capacityTypes?: CapacityType[];

  /**
   * Architecture type of the node instances.
   */
  readonly archTypes: ArchType[];
}

export interface ProviderConfig {
  /**
   * The AMI used when provisioning nodes.
   * Based on the value set for amiFamily,Karpenter will automatically query for the appropriate EKS optimized AMI via AWS Systems Manager (SSM).
   */
  readonly amiFamily?: AMIFamily;

  /**
   * Tags will be added to every EC2 instance launched by the provisioner.
   */
  readonly tags?: {[key: string]: string};
}

export interface Limits {
  /**
   * Memory limits (i.e. 1000Gi)
   */
  readonly mem?: string;

  /**
   * CPU limits (i.e. 256)
   */
  readonly cpu?: string;
}

export interface Taints {
  /**
   * Key
   */
  readonly key: string;

  /**
   * Effect
   */
  readonly effect: string;

  /**
   * Operator
   */
  readonly operator?: string;

  /**
   * Value
   */
  readonly value?: string;
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

export enum AMIFamily {
  /**
   * Amazon Linux 2 AMI family
   * Note: If a custom launch template is specified, then the AMI value
   * in the launch template is used rather than the amiFamily value.
   */
  AL2='AL2',

  /**
   * Bottlerocket AMI family
   */
  BOTTLEROCKET='Bottlerocket',

  /**
   * Ubuntu AMI family
   */
  UBUNTU='Ubuntu',
}

/**
 * This construct adds Karpenter to an existing EKS cluster following the guide located at: https://karpenter.sh/docs/getting-started/.
 * It creates two IAM roles and then adds and installes Karpenter on the EKS cluster. Additionally,
 * it tags subnets with custom tags that are used for instructing Karpenter where to place the nodes.
 */
export class Karpenter extends Construct {
  private readonly availabilityZones: string[];
  private readonly cluster: Cluster;
  private readonly instanceProfile: CfnInstanceProfile;
  private readonly karpenterNodeRole: Role;
  private readonly karpenterControllerRole: Role;
  private readonly karpenterHelmChart: HelmChart;

  constructor(scope: Construct, id: string, props: KarpenterProps) {
    super(scope, id);

    this.cluster = props.cluster;
    this.availabilityZones = props.vpc.availabilityZones;
    const subnets = props.subnets ?? props.vpc.privateSubnets;

    // Custom resource that will tag VPC subnets
    new TagSubnetsCustomResource(this, 'TagSubnets', {
      subnets: subnets.map((subnet) => { return subnet.subnetId; }),
      clusterTag: `karpenter.sh/discovery/${this.cluster.clusterName}`,
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
      description: `This is the IAM role Karpenter uses to give compute permissions for ${this.cluster.clusterName}`,
    });

    [
      'AmazonEKS_CNI_Policy',
      'AmazonEKSWorkerNodePolicy',
      'AmazonEC2ContainerRegistryReadOnly',
      'AmazonSSMManagedInstanceCore',
    ].forEach((policyName) => {
      this.karpenterNodeRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName(policyName));
    });

    this.instanceProfile = new CfnInstanceProfile(this, 'InstanceProfile', {
      roles: [this.karpenterNodeRole.roleName],
      instanceProfileName: `KarpenterNodeInstanceProfile-${this.cluster.clusterName}`,
      path: '/',
    });

    this.cluster.awsAuth.addRoleMapping(this.karpenterNodeRole, {
      groups: [
        'system:bootstrappers',
        'system:nodes',
      ],
      username: 'system:node:{{EC2PrivateDNSName}}',
    });

    const conditions = new CfnJson(this, 'ConditionPlainJson', {
      value: {
        [`${this.cluster.openIdConnectProvider.openIdConnectProviderIssuer}:aud`]: 'sts.amazonaws.com',
        [`${this.cluster.openIdConnectProvider.openIdConnectProviderIssuer}:sub`]: 'system:serviceaccount:karpenter:karpenter',
      },
    });

    const principal = new OpenIdConnectPrincipal(
      this.cluster.openIdConnectProvider,
    ).withConditions({
      StringEquals: conditions,
    });

    this.karpenterControllerRole = new Role(this, 'ControllerRole', {
      assumedBy: principal,
      description: `This is the IAM role Karpenter uses to allocate compute for ${this.cluster.clusterName}`,
    });
    this.karpenterControllerRole.addManagedPolicy(karpenterControllerPolicy);

    this.karpenterHelmChart = new HelmChart(this, 'HelmChart', {
      chart: 'karpenter',
      createNamespace: true,
      version: '0.7.1',
      cluster: this.cluster,
      namespace: 'karpenter',
      release: 'karpenter',
      repository: 'https://charts.karpenter.sh',
      timeout: Duration.minutes(15),
      wait: true,
      values: {
        clusterName: this.cluster.clusterName,
        clusterEndpoint: this.cluster.clusterEndpoint,
        serviceAccount: {
          annotations: {
            'eks.amazonaws.com/role-arn': this.karpenterControllerRole.roleArn,
          },
        },
        aws: {
          defaultInstanceProfile: this.instanceProfile.instanceProfileName,
        },
      },
    });

    new CfnOutput(this, 'clusterName', { value: this.cluster.clusterName });
    // new CfnOutput(this, 'karpenterControllerRole', { value: this.karpenterControllerRole.roleName });
    // new CfnOutput(this, 'karpenterNodeRole', { value: this.karpenterNodeRole.roleName });
    // new CfnOutput(this, 'instanceProfileName', { value: this.instanceProfile.instanceProfileName || '' });
    // new CfnOutput(this, 'karpenterControllerPolicy', { value: karpenterControllerPolicy.managedPolicyName });
  }

  /**
   * addProvisioner adds a provisioner manifest to the cluster.
   *
   * @param id - must consist of lower case alphanumeric characters, \'-\' or \'.\', and must start and end with an alphanumeric character
   * @param provisionerSpecs - spec for the Karpenter Provisioner.
   */
  public addProvisioner(id: string, provisionerSpecs?: ProvisionerSpecs): void {
    const requirements = this.setRequirements(provisionerSpecs?.requirements);
    const provisioner = this.cluster.addManifest(id, {
      apiVersion: 'karpenter.sh/v1alpha5',
      kind: 'Provisioner',
      metadata: {
        name: id.toLowerCase(),
      },
      spec: {
        ...provisionerSpecs?.limits && {
          limits: {
            resources: {
              ...(provisionerSpecs.limits.mem && { mem: provisionerSpecs!.limits.mem }),
              ...(provisionerSpecs.limits.cpu && { cpu: provisionerSpecs!.limits.cpu }),
            },
          },
        },
        ...(provisionerSpecs?.ttlSecondsAfterEmpty && { ttlSecondsAfterEmpty: provisionerSpecs!.ttlSecondsAfterEmpty!.toSeconds() }),
        ...(provisionerSpecs?.ttlSecondsUntilExpired && { ttlSecondsUntilExpired: provisionerSpecs!.ttlSecondsUntilExpired!.toSeconds() }),
        requirements: [
          ...requirements,
        ],
        labels: {
          'cluster-name': this.cluster.clusterName,
          ...provisionerSpecs?.labels,
        },
        ...(provisionerSpecs?.taints && {
          taints: provisionerSpecs!.taints!,
        }),
        provider: {
          subnetSelector: {
            [`karpenter.sh/discovery/${this.cluster.clusterName}`]: '*',
          },
          securityGroupSelector: {
            [`kubernetes.io/cluster/${this.cluster.clusterName}`]: 'owned',
          },
          instanceProfile: this.instanceProfile.instanceProfileName,
          ...(provisionerSpecs?.provider?.tags && { tags: { ...provisionerSpecs!.provider!.tags! } }),
          ...(provisionerSpecs?.provider?.amiFamily && { amiFamily: provisionerSpecs!.provider!.amiFamily! }),
        },
      },
    });
    provisioner.node.addDependency(this.karpenterHelmChart);
  }

  private setRequirements(reqs?: ProvisionerReqs): any[] {
    let requirements: any[] = [
      {
        key: 'karpenter.sh/capacity-type',
        operator: 'In',
        values: reqs?.capacityTypes ?? [CapacityType.SPOT],
      },
      {
        key: 'kubernetes.io/arch',
        operator: 'In',
        values: reqs?.archTypes ?? [ArchType.AMD64],
      },
      {
        key: 'topology.kubernetes.io/zone',
        operator: 'In',
        values: this.availabilityZones,
      },
    ];

    if (reqs?.instanceTypes) {
      requirements.push({
        key: 'node.kubernetes.io/instance-type',
        operator: 'In',
        values: reqs!.instanceTypes!.map((i)=> { return i.toString(); }),
      });
    }

    if (reqs?.rejectInstanceTypes) {
      requirements.push({
        key: 'node.kubernetes.io/instance-type',
        operator: 'NotIn',
        values: reqs!.rejectInstanceTypes!.map((i)=> { return i.toString(); }),
      });
    }

    return requirements;
  }
}