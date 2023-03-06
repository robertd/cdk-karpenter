import { CfnJson, CfnOutput, Duration } from 'aws-cdk-lib';
import { ISubnet, IVpc, InstanceType, EbsDeviceVolumeType } from 'aws-cdk-lib/aws-ec2';
import { Cluster, HelmChart } from 'aws-cdk-lib/aws-eks';
import { Rule } from 'aws-cdk-lib/aws-events';
import { SqsQueue } from 'aws-cdk-lib/aws-events-targets';
import { CfnInstanceProfile, ManagedPolicy, OpenIdConnectPrincipal, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { Queue } from 'aws-cdk-lib/aws-sqs';
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
   * Enables consolidation which attempts to reduce cluster cost by both removing un-needed nodes and down-sizing
   * those that can't be removed.
   * Mutually exclusive with the ttlSecondsAfterEmpty parameter.
   */
  readonly consolidation?: Boolean;

  /**
   * Time in seconds in which nodes will expire and get replaced.
   * If omitted, the feature is disabled and nodes will never expire.
   * i.e. Duration.days(7)
   */
  readonly ttlSecondsUntilExpired?: Duration;

  /**
   * Time in seconds in which nodes will scale down due to low utilization.
   * If omitted, the feature is disabled, nodes will never scale down due to low utilization.
   * Mutually exclusive with the consolidation parameter.
   */
  readonly ttlSecondsAfterEmpty?: Duration;

  /**
   * CPU and Memory Limits. Resource limits constrain the total size of the cluster.
   * Limits prevent Karpenter from creating new instances once the limit is exceeded.
   */
  readonly limits?: Limits;

  /**
   * Labels are arbitrary key-values that are applied to all nodes.
   */
  readonly labels?: {[key: string]: string};

  /**
   * Provisioned nodes will have these taints. Taints may prevent pods from scheduling if they are not tolerated.
   */
  readonly taints?: Taints[];

  /**
   * Provisioned nodes will have these taints, but pods do not need to tolerate these taints to be provisioned by this
   * provisioner. These taints are expected to be temporary and some other entity (e.g. a DaemonSet) is responsible for
   * removing the taint after it has finished initializing the node.
   */
  readonly startupTaints?: Taints[];

  /**
   * Requirements that constrain the parameters of provisioned nodes.
   * These requirements are combined with pod.spec.affinity.nodeAffinity rules.
   */
  readonly requirements: ProvisionerReqs;

  /**
   * AWS cloud provider configuration.
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
   * Provisioner level tags. Tags will be added to every EC2 instance launched by the provisioner.
   * Provisioner level tags override global Karpenter tags.
   */
  readonly tags?: {[key: string]: string};

  /**
   * EBS mapping configuration.
   */
  readonly blockDeviceMappings?: BlockDeviceMappingsProps[];

  /**
   * AMISelector is used to configure custom AMIs for Karpenter to use, where the AMIs
   * are discovered through AWS tags, similar to subnetSelector. This field is optional,
   * and Karpenter will use the latest EKS-optimized AMIs if an amiSelector is not specified.
   */
  readonly amiSelector?: {[key: string]: string};
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

  /**
   * Custom AMI family
   */
  CUSTOM='Custom',
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
  private readonly karpenterControllerPolicy: ManagedPolicy;
  private readonly karpenterInterruptionQueue: Queue;
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

    this.karpenterInterruptionQueue = new Queue(this, 'InterruptionQueue', {
      queueName: this.cluster.clusterName,
      retentionPeriod: Duration.minutes(5),
    });

    // KarpenterInterruptionQueuePolicy
    this.karpenterInterruptionQueue.addToResourcePolicy(new PolicyStatement({
      actions: [
        'sqs:SendMessage',
      ],
      principals: [
        new ServicePrincipal('events.amazonaws.com'),
        new ServicePrincipal('sqs.amazonaws.com'),
      ],
    }));

    [
      // ScheduledChangeRule
      new Rule(this, 'ScheduledChangeRule', {
        eventPattern: {
          source: ['aws.health'],
          detailType: ['AWS Health Event'],
        },
      }),
      // SpotInterruptionRule
      new Rule(this, 'SpotInterruptionRule', {
        eventPattern: {
          source: ['aws.ec2'],
          detailType: ['EC2 Spot Instance Interruption Warning'],
        },
      }),
      // RebalanceRule
      new Rule(this, 'RebalanceRule', {
        eventPattern: {
          source: ['aws.ec2'],
          detailType: ['EC2 Instance Rebalance Recommendation'],
        },
      }),
      // InstanceStateChangeRule
      new Rule(this, 'InstanceStateChangeRule', {
        eventPattern: {
          source: ['aws.ec2'],
          detailType: ['EC2 Instance State-change Notification'],
        },
      }),
    ].forEach((rule) => {
      rule.addTarget(new SqsQueue(this.karpenterInterruptionQueue));
    });

    this.karpenterNodeRole = new Role(this, 'NodeRole', {
      assumedBy: new ServicePrincipal('ec2.amazonaws.com'),
      description: `This is the IAM role Karpenter uses to give compute permissions for ${this.cluster.clusterName}`,
    });

    this.karpenterControllerPolicy = new ManagedPolicy(this, 'ControllerPolicy', {
      statements: [
        new PolicyStatement({
          actions: [
            // Write Operations
            'ec2:CreateFleet',
            'ec2:CreateLaunchTemplate',
            'ec2:CreateTags',
            'ec2:DeleteLaunchTemplate',
            'ec2:RunInstances',
            'ec2:TerminateInstances',
            // Read Operations
            'ec2:DescribeAvailabilityZones',
            'ec2:DescribeImages',
            'ec2:DescribeInstances',
            'ec2:DescribeInstanceTypeOfferings',
            'ec2:DescribeInstanceTypes',
            'ec2:DescribeLaunchTemplates',
            'ec2:DescribeSecurityGroups',
            'ec2:DescribeSpotPriceHistory',
            'ec2:DescribeSubnets',
            'pricing:GetProducts',
            'ssm:GetParameter',
          ],
          resources: ['*'],
        }),
        new PolicyStatement({
          actions: [
            // Write Operations
            'sqs:DeleteMessage',
            // Read Operations
            'sqs:GetQueueAttributes',
            'sqs:GetQueueUrl',
            'sqs:ReceiveMessage',
          ],
          resources: [
            this.karpenterInterruptionQueue.queueArn,
          ],
        }),
        new PolicyStatement({
          actions: [
            'iam:PassRole',
          ],
          resources: [
            this.karpenterNodeRole.roleArn,
          ],
        }),
        new PolicyStatement({
          actions: [
            'eks:DescribeCluster',
          ],
          resources: [
            this.cluster.clusterArn,
          ],
        }),
      ],
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

    this.karpenterControllerRole.addManagedPolicy(this.karpenterControllerPolicy);

    this.karpenterHelmChart = new HelmChart(this, 'KarpenterHelmChart', {
      chart: 'karpenter',
      createNamespace: true,
      version: 'v0.26.1',
      cluster: this.cluster,
      namespace: 'karpenter',
      release: 'karpenter',
      repository: 'oci://public.ecr.aws/karpenter/karpenter',
      timeout: Duration.minutes(15),
      wait: true,
      values: {
        serviceAccount: {
          annotations: {
            'eks.amazonaws.com/role-arn': this.karpenterControllerRole.roleArn,
          },
        },
        // see: https://karpenter.sh/v0.26.1/concepts/settings/
        settings: {
          aws: {
            clusterName: this.cluster.clusterName,
            interruptionQueueName: this.karpenterInterruptionQueue.queueName,
            // instanceProfile is created using L1 construct (CfnInstanceProfile), thus we're referencing ref directly
            // TODO: revisit this when L2 InstanceProfile construct is released
            defaultInstanceProfile: this.instanceProfile.ref,
          },
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
    if (provisionerSpecs && provisionerSpecs.consolidation && provisionerSpecs.ttlSecondsAfterEmpty) {
      throw new Error('Parameters consolidation and ttlSecondsAfterEmpty are mutually exclusive.');
    }

    // see: https://karpenter.sh/v0.26.1/concepts/provisioners/
    // see: https://karpenter.sh/v0.26.1/concepts/node-templates/
    const awsNodeTemplateId = `${id}-awsNodeTemplate`.toLowerCase();
    const awsNodeTemplate = this.cluster.addManifest(awsNodeTemplateId, {
      apiVersion: 'karpenter.k8s.aws/v1alpha1',
      kind: 'AWSNodeTemplate',
      metadata: {
        name: awsNodeTemplateId,
      },
      spec: {
        // see: https://karpenter.sh/v0.26.1/concepts/node-templates/#specsubnetselector
        subnetSelector: {
          [`karpenter.sh/discovery/${this.cluster.clusterName}`]: '*',
        },
        // see: https://karpenter.sh/v0.26.1/concepts/node-templates/#specsecuritygroupselector
        securityGroupSelector: {
          [`kubernetes.io/cluster/${this.cluster.clusterName}`]: 'owned',
        },
        // see: https://karpenter.sh/v0.26.1/concepts/node-templates/#specsecuritygroupselector
        // instanceProfile is created using L1 construct (CfnInstanceProfile), thus we're referencing ref directly
        // TODO: revisit this when L2 InstanceProfile construct is released
        instanceProfile: this.instanceProfile.ref,
        // see: https://karpenter.sh/v0.26.1/concepts/node-templates/#specamifamily
        ...(provisionerSpecs?.provider?.amiFamily && { amiFamily: provisionerSpecs!.provider!.amiFamily! }),
        // see https://karpenter.sh/v0.26.1/concepts/node-templates/#specamiselector
        ...(provisionerSpecs?.provider?.amiSelector && { amiSelector: { ...provisionerSpecs!.provider!.amiSelector! } }),
        // see: https://karpenter.sh/v0.26.1/concepts/node-templates/#spectags
        ...(provisionerSpecs?.provider?.tags && { tags: { ...provisionerSpecs!.provider!.tags! } }),
        // see: https://karpenter.sh/v0.26.1/concepts/node-templates/#specblockdevicemappings
        ...(provisionerSpecs?.provider?.blockDeviceMappings && { blockDeviceMappings: provisionerSpecs!.provider!.blockDeviceMappings! }),
        // TODO: add userData https://karpenter.sh/v0.26.1/concepts/node-templates/#specuserdata
        // TODO: add metadataOptions https://karpenter.sh/v0.26.1/concepts/node-templates/#specmetadataoptions
      },
    });

    // see: https://karpenter.sh/v0.26.1/concepts/provisioners/#specrequirements
    const requirements = this.setRequirements(provisionerSpecs?.requirements);

    // see: https://karpenter.sh/v0.26.1/concepts/provisioners/
    const provisioner = this.cluster.addManifest(id, {
      apiVersion: 'karpenter.sh/v1alpha5',
      kind: 'Provisioner',
      metadata: {
        name: id.toLowerCase(),
      },
      spec: {
        // see: https://karpenter.sh/v0.26.1/concepts/provisioners/#speclimitsresources
        ...(provisionerSpecs?.limits && {
          limits: {
            resources: {
              ...(provisionerSpecs!.limits.mem && { mem: provisionerSpecs!.limits.mem }),
              ...(provisionerSpecs!.limits.cpu && { cpu: provisionerSpecs!.limits.cpu }),
            },
          },
        }),
        // see: https://karpenter.sh/v0.26.1/concepts/provisioners/#specconsolidation
        ...provisionerSpecs?.consolidation && {
          consolidation: {
            enabled: provisionerSpecs!.consolidation,
          },
        },
        ...(provisionerSpecs?.ttlSecondsAfterEmpty && { ttlSecondsAfterEmpty: provisionerSpecs!.ttlSecondsAfterEmpty!.toSeconds() }),
        ...(provisionerSpecs?.ttlSecondsUntilExpired && { ttlSecondsUntilExpired: provisionerSpecs!.ttlSecondsUntilExpired!.toSeconds() }),
        // see: https://karpenter.sh/v0.26.1/concepts/provisioners/#specrequirements
        requirements: [
          ...requirements,
        ],
        labels: {
          'cluster-name': this.cluster.clusterName,
          ...provisionerSpecs?.labels,
        },
        ...(provisionerSpecs?.taints && { taints: provisionerSpecs!.taints! }),
        ...(provisionerSpecs?.startupTaints && { startupTaints: provisionerSpecs!.startupTaints! }),
        // see: https://karpenter.sh/v0.26.1/concepts/provisioners/#specproviderref
        providerRef: {
          name: awsNodeTemplateId,
        },
      },
    });

    provisioner.node.addDependency(awsNodeTemplate);
    awsNodeTemplate.node.addDependency(this.karpenterHelmChart);
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