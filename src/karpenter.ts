import { CfnJson, CfnOutput, Duration } from 'aws-cdk-lib';
import { ISubnet, IVpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster, HelmChart, KubernetesVersion } from 'aws-cdk-lib/aws-eks';
import { CfnInstanceProfile, ManagedPolicy, OpenIdConnectPrincipal, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { TagSubnetsCustomResource } from './custom-resource';

export interface IKarpenterProps {
  /**
   * The Cluster on which Karpenter needs to be added
   */
  readonly cluster: Cluster;

  /**
   * VPC
   */
  readonly vpc: IVpc;

  /**
   * The VPC subnets which need to be tagged for Karpenter to find them
   */
  readonly subnets?: ISubnet[];

  /**
   * The Kubernetes version for the Bottlerocket AMI that Karpenter is going to use
   */
  readonly k8sVersion: KubernetesVersion;
}

/**
 * This construct adds Karpenter on a clusterrole level to an eks.FargateCluster
 * following the guide: https://karpenter.sh/docs/getting-started/
 * It creates 2 IAM roles, one for the Nodes and one for the Controller.
 * It then adds and configures Karpenter on the cluster
 */
export class Karpenter extends Construct {
  public readonly karpenterNodeRole: Role;
  public readonly karpenterControllerRole: Role;
  public readonly karpenterHelmChart: HelmChart;

  constructor(scope: Construct, id: string, props: IKarpenterProps) {
    super(scope, id);

    const subnets = props.subnets ? props.subnets : props.vpc.privateSubnets;

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

    // props.cluster.addServiceAccount('karpenter', {
    //   name: 'karpenter',
    //   namespace: 'karpenter',
    // });

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
      version: '0.6.1',
      cluster: props.cluster,
      namespace: 'karpenter',
      release: 'karpenter',
      repository: 'https://charts.karpenter.sh',
      timeout: Duration.minutes(15),
      wait: true,
      values: {
        controller: {
          clusterName: props.cluster.clusterName,
          clusterEndpoint: props.cluster.clusterEndpoint,
        },
        serviceAccount: {
          create: 'false',
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
    const karpenterGlobalProvider = props.cluster.addManifest('karpenterGlobalProvider', {
      apiVersion: 'karpenter.sh/v1alpha5',
      kind: 'Provisioner',
      metadata: {
        name: 'default',
      },
      spec: {
        ttlSecondsUntilExpired: Duration.minutes(10).toSeconds(),
        ttlSecondsAfterEmpty: Duration.seconds(30).toSeconds(),
        requirements: [
          {
            key: 'karpenter.sh/capacity-type',
            operator: 'In',
            values: ['spot'],
          },
          {
            key: 'kubernetes.io/arch',
            operator: 'In',
            values: ['amd64'],
          },
          // {
          //   key: 'node.kubernetes.io/instance-type',
          //   operator: 'In',
          //   values: ['t3a.small'],
          // },
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
        },
      },
    });

    karpenterGlobalProvider.node.addDependency(this.karpenterHelmChart);

    new CfnOutput(this, 'karpenterControllerRole', { value: this.karpenterControllerRole.roleName });
    new CfnOutput(this, 'karpenterNodeRole', { value: this.karpenterNodeRole.roleName });
    new CfnOutput(this, 'instanceProfileName', { value: instanceProfile.instanceProfileName || '' });
    new CfnOutput(this, 'clusterName', { value: props.cluster.clusterName });
    new CfnOutput(this, 'karpenterControllerPolicy', { value: karpenterControllerPolicy.managedPolicyName });
  }
}