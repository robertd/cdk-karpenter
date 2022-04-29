import { CfnJson, CfnOutput, Duration } from 'aws-cdk-lib';
import { ISubnet, IVpc, InstanceType, EbsDeviceVolumeType } from 'aws-cdk-lib/aws-ec2';
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
  readonly provider?: ProviderProps;
}

export interface ProvisionerReqs {
  /**
   * Instance types to be used by the Karpenter Provider.
   */
  readonly instanceTypes?: InstanceType[];

  /**
   * Instance types to be excluded by the Karpenter Provider.
   */
  readonly restrictInstanceTypes?: InstanceType[];

  /**
   * Capacity type of the node instances.
   */
  readonly capacityTypes?: CapacityType[];

  /**
   * Architecture type of the node instances.
   */
  readonly archTypes: ArchType[];
}

export interface ProviderProps {
  /**
   * The AMI used when provisioning nodes.
   * Based on the value set for amiFamily,Karpenter will automatically
   * query for the appropriate EKS optimized AMI via AWS Systems Manager (SSM).
   */
  readonly amiFamily?: AMIFamily;

  /**
   * Tags will be added to every EC2 instance launched by the provisioner.
   */
  readonly tags?: {[key: string]: string};

  /**
   * EBS
   */
  readonly blockDeviceMappings?: BlockDeviceMappingsProps[];
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

export interface BlockDeviceMappingsProps {
  /**
   * The device name (for example, /dev/sdh or xvdh)
   */
  readonly deviceName: string;

  readonly ebs?: EbsProps;
}

/**
 * Parameters used to automatically set up EBS volumes when the instance is launched.
 */
export interface EbsProps {
  /**
   * Indicates whether the volume should be encrypted.
   */
  readonly encrypted?: boolean;

  /**
   * Indicates whether the EBS volume is deleted on instance termination.
   */
  readonly deleteOnTermination?: boolean;

  /**
   * The size of the volume, in GiBs.
   * You must specify either a snapshot ID or a volume size. If you specify a snapshot, the default is the snapshot size. You can specify a volume size that is equal to or larger than the snapshot size.
   *
   * The following are the supported volumes sizes for each volume type:
   * - gp2 and gp3 :1-16,384
   * - io1 and io2 : 4-16,384
   * - st1 and sc1 : 125-16,384
   * - standard : 1-1,024
   */
  readonly volumeSize?: string;

  /**
   * The volume type. For more information, see Amazon EBS volume types in the Amazon EC2 User Guide.
   * If the volume type is io1 or io2, you must specify the IOPS that the volume supports.
   */
  readonly volumeType?: EbsDeviceVolumeType;

  /**
   * The identifier of the AWS KMS key to use for Amazon EBS encryption. If KmsKeyId is specified, the encrypted state must be true.
   * If the encrypted state is true but you do not specify KmsKeyId, your KMS key for EBS is used.
   *
   * You can specify the KMS key using key ARN. For example, arn:aws:kms:us-west-2:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab.
   */
  readonly kmsKeyId?: string;

  /**
   * Throughput to provision for a gp3 volume, with a maximum of 1,000 MiB/s.
   *
   * Valid Range: Minimum value of 125. Maximum value of 1000.
   */
  readonly throughput?: number;

  /**
   * The number of I/O operations per second (IOPS).
   *
   * For gp3 , io1 , and io2 volumes, this represents the number of IOPS that are provisioned for the volume.
   * For gp2 volumes, this represents the baseline performance of the volume and the rate at which the volume accumulates
   * I/O credits for bursting.
   *
   * The following are the supported values for each volume type:
   * - gp3 : 3,000-16,000 IOPS
   * - io1 : 100-64,000 IOPS
   * - io2 : 100-64,000 IOPS
   *
   * For io1 and io2 volumes, we guarantee 64,000 IOPS only for Instances built on the Nitro System.
   * Other instance families guarantee performance up to 32,000 IOPS.
   *
    * This parameter is required for io1 and io2 volumes. The default for gp3 volumes is 3,000 IOPS.
    * This parameter is not supported for gp2, st1, sc1, or standard volumes.
   */
  readonly iops?: number;

  /**
   * The snapshot ID of the volume to use. If you specify both SnapshotId and VolumeSize, VolumeSize must be equal or greater than the size of the snapshot.
   */
  readonly snapshotId?: string;
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
      version: '0.9.0',
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
          // instanceProfile is created using L1 construct (CfnInstanceProfile), thus we're referencing logicalId directly
          // TODO: revisit this when L2 InstanceProfile construct is released
          defaultInstanceProfile: this.instanceProfile.logicalId,
        },
      },
    });

    new CfnOutput(this, 'clusterName', { value: this.cluster.clusterName });
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
              ...(provisionerSpecs!.limits.mem && { mem: provisionerSpecs!.limits.mem }),
              ...(provisionerSpecs!.limits.cpu && { cpu: provisionerSpecs!.limits.cpu }),
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
        ...(provisionerSpecs?.taints && { taints: provisionerSpecs!.taints! }),
        provider: {
          subnetSelector: {
            [`karpenter.sh/discovery/${this.cluster.clusterName}`]: '*',
          },
          securityGroupSelector: {
            [`kubernetes.io/cluster/${this.cluster.clusterName}`]: 'owned',
          },
          // instanceProfile is created using L1 construct (CfnInstanceProfile), thus we're referencing logicalId directly
          // TODO: revisit this when L2 InstanceProfile construct is released
          instanceProfile: this.instanceProfile.logicalId,
          ...(provisionerSpecs?.provider?.tags && { tags: { ...provisionerSpecs!.provider!.tags! } }),
          ...(provisionerSpecs?.provider?.amiFamily && { amiFamily: provisionerSpecs!.provider!.amiFamily! }),
          ...(provisionerSpecs?.provider?.blockDeviceMappings && { blockDeviceMappings: provisionerSpecs!.provider!.blockDeviceMappings! }),
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

    if (reqs?.restrictInstanceTypes) {
      requirements.push({
        key: 'node.kubernetes.io/instance-type',
        operator: 'NotIn',
        values: reqs!.restrictInstanceTypes!.map((i)=> { return i.toString(); }),
      });
    }

    return requirements;
  }
}