# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### Karpenter <a name="Karpenter" id="cdk-karpenter.Karpenter"></a>

This construct adds Karpenter to an existing EKS cluster following the guide located at: https://karpenter.sh/docs/getting-started/. It creates two IAM roles and then adds and installes Karpenter on the EKS cluster. Additionally, it tags subnets with custom tags that are used for instructing Karpenter where to place the nodes.

#### Initializers <a name="Initializers" id="cdk-karpenter.Karpenter.Initializer"></a>

```typescript
import { Karpenter } from 'cdk-karpenter'

new Karpenter(scope: Construct, id: string, props: KarpenterProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-karpenter.Karpenter.Initializer.parameter.scope">scope</a></code> | <code>constructs.Construct</code> | *No description.* |
| <code><a href="#cdk-karpenter.Karpenter.Initializer.parameter.id">id</a></code> | <code>string</code> | *No description.* |
| <code><a href="#cdk-karpenter.Karpenter.Initializer.parameter.props">props</a></code> | <code><a href="#cdk-karpenter.KarpenterProps">KarpenterProps</a></code> | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="scope" id="cdk-karpenter.Karpenter.Initializer.parameter.scope"></a>

- *Type:* constructs.Construct

---

##### `id`<sup>Required</sup> <a name="id" id="cdk-karpenter.Karpenter.Initializer.parameter.id"></a>

- *Type:* string

---

##### `props`<sup>Required</sup> <a name="props" id="cdk-karpenter.Karpenter.Initializer.parameter.props"></a>

- *Type:* <a href="#cdk-karpenter.KarpenterProps">KarpenterProps</a>

---

#### Methods <a name="Methods" id="Methods"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-karpenter.Karpenter.toString">toString</a></code> | Returns a string representation of this construct. |
| <code><a href="#cdk-karpenter.Karpenter.addProvisioner">addProvisioner</a></code> | addProvisioner adds a provisioner manifest to the cluster. |

---

##### `toString` <a name="toString" id="cdk-karpenter.Karpenter.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

##### `addProvisioner` <a name="addProvisioner" id="cdk-karpenter.Karpenter.addProvisioner"></a>

```typescript
public addProvisioner(id: string, provisionerSpecs?: ProvisionerSpecs): void
```

addProvisioner adds a provisioner manifest to the cluster.

###### `id`<sup>Required</sup> <a name="id" id="cdk-karpenter.Karpenter.addProvisioner.parameter.id"></a>

- *Type:* string

must consist of lower case alphanumeric characters, \'-\' or \'.\', and must start and end with an alphanumeric character.

---

###### `provisionerSpecs`<sup>Optional</sup> <a name="provisionerSpecs" id="cdk-karpenter.Karpenter.addProvisioner.parameter.provisionerSpecs"></a>

- *Type:* <a href="#cdk-karpenter.ProvisionerSpecs">ProvisionerSpecs</a>

spec for the Karpenter Provisioner.

---

#### Static Functions <a name="Static Functions" id="Static Functions"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-karpenter.Karpenter.isConstruct">isConstruct</a></code> | Checks if `x` is a construct. |

---

##### ~~`isConstruct`~~ <a name="isConstruct" id="cdk-karpenter.Karpenter.isConstruct"></a>

```typescript
import { Karpenter } from 'cdk-karpenter'

Karpenter.isConstruct(x: any)
```

Checks if `x` is a construct.

###### `x`<sup>Required</sup> <a name="x" id="cdk-karpenter.Karpenter.isConstruct.parameter.x"></a>

- *Type:* any

Any object.

---

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-karpenter.Karpenter.property.node">node</a></code> | <code>constructs.Node</code> | The tree node. |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-karpenter.Karpenter.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---


## Structs <a name="Structs" id="Structs"></a>

### KarpenterProps <a name="KarpenterProps" id="cdk-karpenter.KarpenterProps"></a>

#### Initializer <a name="Initializer" id="cdk-karpenter.KarpenterProps.Initializer"></a>

```typescript
import { KarpenterProps } from 'cdk-karpenter'

const karpenterProps: KarpenterProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-karpenter.KarpenterProps.property.cluster">cluster</a></code> | <code>aws-cdk-lib.aws_eks.Cluster</code> | The EKS cluster on which Karpenter is going to be installed on. |
| <code><a href="#cdk-karpenter.KarpenterProps.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | VPC. |
| <code><a href="#cdk-karpenter.KarpenterProps.property.subnets">subnets</a></code> | <code>aws-cdk-lib.aws_ec2.ISubnet[]</code> | VPC subnets which need to be tagged for Karpenter to find them. |

---

##### `cluster`<sup>Required</sup> <a name="cluster" id="cdk-karpenter.KarpenterProps.property.cluster"></a>

```typescript
public readonly cluster: Cluster;
```

- *Type:* aws-cdk-lib.aws_eks.Cluster

The EKS cluster on which Karpenter is going to be installed on.

---

##### `vpc`<sup>Required</sup> <a name="vpc" id="cdk-karpenter.KarpenterProps.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc

VPC.

---

##### `subnets`<sup>Optional</sup> <a name="subnets" id="cdk-karpenter.KarpenterProps.property.subnets"></a>

```typescript
public readonly subnets: ISubnet[];
```

- *Type:* aws-cdk-lib.aws_ec2.ISubnet[]

VPC subnets which need to be tagged for Karpenter to find them.

If left blank, private VPC subnets will be used and tagged by default.

---

### Limits <a name="Limits" id="cdk-karpenter.Limits"></a>

#### Initializer <a name="Initializer" id="cdk-karpenter.Limits.Initializer"></a>

```typescript
import { Limits } from 'cdk-karpenter'

const limits: Limits = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-karpenter.Limits.property.cpu">cpu</a></code> | <code>string</code> | CPU limits (i.e. 256). |
| <code><a href="#cdk-karpenter.Limits.property.mem">mem</a></code> | <code>string</code> | Memory limits (i.e. 1000Gi). |

---

##### `cpu`<sup>Optional</sup> <a name="cpu" id="cdk-karpenter.Limits.property.cpu"></a>

```typescript
public readonly cpu: string;
```

- *Type:* string

CPU limits (i.e. 256).

---

##### `mem`<sup>Optional</sup> <a name="mem" id="cdk-karpenter.Limits.property.mem"></a>

```typescript
public readonly mem: string;
```

- *Type:* string

Memory limits (i.e. 1000Gi).

---

### ProviderConfig <a name="ProviderConfig" id="cdk-karpenter.ProviderConfig"></a>

#### Initializer <a name="Initializer" id="cdk-karpenter.ProviderConfig.Initializer"></a>

```typescript
import { ProviderConfig } from 'cdk-karpenter'

const providerConfig: ProviderConfig = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-karpenter.ProviderConfig.property.amiFamily">amiFamily</a></code> | <code><a href="#cdk-karpenter.AMIFamily">AMIFamily</a></code> | The AMI used when provisioning nodes. |
| <code><a href="#cdk-karpenter.ProviderConfig.property.tags">tags</a></code> | <code>{[ key: string ]: string}</code> | Tags will be added to every EC2 instance launched by the provisioner. |

---

##### `amiFamily`<sup>Optional</sup> <a name="amiFamily" id="cdk-karpenter.ProviderConfig.property.amiFamily"></a>

```typescript
public readonly amiFamily: AMIFamily;
```

- *Type:* <a href="#cdk-karpenter.AMIFamily">AMIFamily</a>

The AMI used when provisioning nodes.

Based on the value set for amiFamily,Karpenter will automatically query for the appropriate EKS optimized AMI via AWS Systems Manager (SSM).

---

##### `tags`<sup>Optional</sup> <a name="tags" id="cdk-karpenter.ProviderConfig.property.tags"></a>

```typescript
public readonly tags: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

Tags will be added to every EC2 instance launched by the provisioner.

---

### ProvisionerReqs <a name="ProvisionerReqs" id="cdk-karpenter.ProvisionerReqs"></a>

#### Initializer <a name="Initializer" id="cdk-karpenter.ProvisionerReqs.Initializer"></a>

```typescript
import { ProvisionerReqs } from 'cdk-karpenter'

const provisionerReqs: ProvisionerReqs = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-karpenter.ProvisionerReqs.property.archTypes">archTypes</a></code> | <code><a href="#cdk-karpenter.ArchType">ArchType</a>[]</code> | Architecture type of the node instances. |
| <code><a href="#cdk-karpenter.ProvisionerReqs.property.capacityTypes">capacityTypes</a></code> | <code><a href="#cdk-karpenter.CapacityType">CapacityType</a>[]</code> | Capacity type of the node instances. |
| <code><a href="#cdk-karpenter.ProvisionerReqs.property.instanceTypes">instanceTypes</a></code> | <code>aws-cdk-lib.aws_ec2.InstanceType[]</code> | Instance types to be used by the Karpenter Provider. |
| <code><a href="#cdk-karpenter.ProvisionerReqs.property.rejectInstanceTypes">rejectInstanceTypes</a></code> | <code>aws-cdk-lib.aws_ec2.InstanceType[]</code> | Instance types to be rejected by the Karpenter Provider. |

---

##### `archTypes`<sup>Required</sup> <a name="archTypes" id="cdk-karpenter.ProvisionerReqs.property.archTypes"></a>

```typescript
public readonly archTypes: ArchType[];
```

- *Type:* <a href="#cdk-karpenter.ArchType">ArchType</a>[]

Architecture type of the node instances.

---

##### `capacityTypes`<sup>Optional</sup> <a name="capacityTypes" id="cdk-karpenter.ProvisionerReqs.property.capacityTypes"></a>

```typescript
public readonly capacityTypes: CapacityType[];
```

- *Type:* <a href="#cdk-karpenter.CapacityType">CapacityType</a>[]

Capacity type of the node instances.

---

##### `instanceTypes`<sup>Optional</sup> <a name="instanceTypes" id="cdk-karpenter.ProvisionerReqs.property.instanceTypes"></a>

```typescript
public readonly instanceTypes: InstanceType[];
```

- *Type:* aws-cdk-lib.aws_ec2.InstanceType[]

Instance types to be used by the Karpenter Provider.

---

##### `rejectInstanceTypes`<sup>Optional</sup> <a name="rejectInstanceTypes" id="cdk-karpenter.ProvisionerReqs.property.rejectInstanceTypes"></a>

```typescript
public readonly rejectInstanceTypes: InstanceType[];
```

- *Type:* aws-cdk-lib.aws_ec2.InstanceType[]

Instance types to be rejected by the Karpenter Provider.

---

### ProvisionerSpecs <a name="ProvisionerSpecs" id="cdk-karpenter.ProvisionerSpecs"></a>

#### Initializer <a name="Initializer" id="cdk-karpenter.ProvisionerSpecs.Initializer"></a>

```typescript
import { ProvisionerSpecs } from 'cdk-karpenter'

const provisionerSpecs: ProvisionerSpecs = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-karpenter.ProvisionerSpecs.property.requirements">requirements</a></code> | <code><a href="#cdk-karpenter.ProvisionerReqs">ProvisionerReqs</a></code> | Requirements that constrain the parameters of provisioned nodes. |
| <code><a href="#cdk-karpenter.ProvisionerSpecs.property.labels">labels</a></code> | <code>{[ key: string ]: string}</code> | Labels are arbitrary key-values that are applied to all nodes. |
| <code><a href="#cdk-karpenter.ProvisionerSpecs.property.limits">limits</a></code> | <code><a href="#cdk-karpenter.Limits">Limits</a></code> | CPU and Memory Limits. |
| <code><a href="#cdk-karpenter.ProvisionerSpecs.property.provider">provider</a></code> | <code><a href="#cdk-karpenter.ProviderConfig">ProviderConfig</a></code> | AWS cloud provider configuration. |
| <code><a href="#cdk-karpenter.ProvisionerSpecs.property.taints">taints</a></code> | <code><a href="#cdk-karpenter.Taints">Taints</a>[]</code> | Provisioned nodes will have these taints. |
| <code><a href="#cdk-karpenter.ProvisionerSpecs.property.ttlSecondsAfterEmpty">ttlSecondsAfterEmpty</a></code> | <code>aws-cdk-lib.Duration</code> | Time in seconds in which nodes will scale down due to low utilization. |
| <code><a href="#cdk-karpenter.ProvisionerSpecs.property.ttlSecondsUntilExpired">ttlSecondsUntilExpired</a></code> | <code>aws-cdk-lib.Duration</code> | Time in seconds in which nodes will expire and get replaced. |

---

##### `requirements`<sup>Required</sup> <a name="requirements" id="cdk-karpenter.ProvisionerSpecs.property.requirements"></a>

```typescript
public readonly requirements: ProvisionerReqs;
```

- *Type:* <a href="#cdk-karpenter.ProvisionerReqs">ProvisionerReqs</a>

Requirements that constrain the parameters of provisioned nodes.

These requirements are combined with pod.spec.affinity.nodeAffinity rules.

---

##### `labels`<sup>Optional</sup> <a name="labels" id="cdk-karpenter.ProvisionerSpecs.property.labels"></a>

```typescript
public readonly labels: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

Labels are arbitrary key-values that are applied to all nodes.

---

##### `limits`<sup>Optional</sup> <a name="limits" id="cdk-karpenter.ProvisionerSpecs.property.limits"></a>

```typescript
public readonly limits: Limits;
```

- *Type:* <a href="#cdk-karpenter.Limits">Limits</a>

CPU and Memory Limits.

Resource limits constrain the total size of the cluster. Limits prevent Karpenter from creating new instances once the limit is exceeded.

---

##### `provider`<sup>Optional</sup> <a name="provider" id="cdk-karpenter.ProvisionerSpecs.property.provider"></a>

```typescript
public readonly provider: ProviderConfig;
```

- *Type:* <a href="#cdk-karpenter.ProviderConfig">ProviderConfig</a>

AWS cloud provider configuration.

---

##### `taints`<sup>Optional</sup> <a name="taints" id="cdk-karpenter.ProvisionerSpecs.property.taints"></a>

```typescript
public readonly taints: Taints[];
```

- *Type:* <a href="#cdk-karpenter.Taints">Taints</a>[]

Provisioned nodes will have these taints.

Taints may prevent pods from scheduling if they are not tolerated.

---

##### `ttlSecondsAfterEmpty`<sup>Optional</sup> <a name="ttlSecondsAfterEmpty" id="cdk-karpenter.ProvisionerSpecs.property.ttlSecondsAfterEmpty"></a>

```typescript
public readonly ttlSecondsAfterEmpty: Duration;
```

- *Type:* aws-cdk-lib.Duration

Time in seconds in which nodes will scale down due to low utilization.

If omitted, the feature is disabled, nodes will never scale down due to low utilization

---

##### `ttlSecondsUntilExpired`<sup>Optional</sup> <a name="ttlSecondsUntilExpired" id="cdk-karpenter.ProvisionerSpecs.property.ttlSecondsUntilExpired"></a>

```typescript
public readonly ttlSecondsUntilExpired: Duration;
```

- *Type:* aws-cdk-lib.Duration

Time in seconds in which nodes will expire and get replaced.

If omitted, the feature is disabled and nodes will never expire. i.e. Duration.days(7)

---

### Taints <a name="Taints" id="cdk-karpenter.Taints"></a>

#### Initializer <a name="Initializer" id="cdk-karpenter.Taints.Initializer"></a>

```typescript
import { Taints } from 'cdk-karpenter'

const taints: Taints = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-karpenter.Taints.property.effect">effect</a></code> | <code>string</code> | Effect. |
| <code><a href="#cdk-karpenter.Taints.property.key">key</a></code> | <code>string</code> | Key. |
| <code><a href="#cdk-karpenter.Taints.property.operator">operator</a></code> | <code>string</code> | Operator. |
| <code><a href="#cdk-karpenter.Taints.property.value">value</a></code> | <code>string</code> | Value. |

---

##### `effect`<sup>Required</sup> <a name="effect" id="cdk-karpenter.Taints.property.effect"></a>

```typescript
public readonly effect: string;
```

- *Type:* string

Effect.

---

##### `key`<sup>Required</sup> <a name="key" id="cdk-karpenter.Taints.property.key"></a>

```typescript
public readonly key: string;
```

- *Type:* string

Key.

---

##### `operator`<sup>Optional</sup> <a name="operator" id="cdk-karpenter.Taints.property.operator"></a>

```typescript
public readonly operator: string;
```

- *Type:* string

Operator.

---

##### `value`<sup>Optional</sup> <a name="value" id="cdk-karpenter.Taints.property.value"></a>

```typescript
public readonly value: string;
```

- *Type:* string

Value.

---



## Enums <a name="Enums" id="Enums"></a>

### AMIFamily <a name="AMIFamily" id="cdk-karpenter.AMIFamily"></a>

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-karpenter.AMIFamily.AL2">AL2</a></code> | Amazon Linux 2 AMI family Note: If a custom launch template is specified, then the AMI value in the launch template is used rather than the amiFamily value. |
| <code><a href="#cdk-karpenter.AMIFamily.BOTTLEROCKET">BOTTLEROCKET</a></code> | Bottlerocket AMI family. |
| <code><a href="#cdk-karpenter.AMIFamily.UBUNTU">UBUNTU</a></code> | Ubuntu AMI family. |

---

##### `AL2` <a name="AL2" id="cdk-karpenter.AMIFamily.AL2"></a>

Amazon Linux 2 AMI family Note: If a custom launch template is specified, then the AMI value in the launch template is used rather than the amiFamily value.

---


##### `BOTTLEROCKET` <a name="BOTTLEROCKET" id="cdk-karpenter.AMIFamily.BOTTLEROCKET"></a>

Bottlerocket AMI family.

---


##### `UBUNTU` <a name="UBUNTU" id="cdk-karpenter.AMIFamily.UBUNTU"></a>

Ubuntu AMI family.

---


### ArchType <a name="ArchType" id="cdk-karpenter.ArchType"></a>

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-karpenter.ArchType.ARM64">ARM64</a></code> | ARM based instances. |
| <code><a href="#cdk-karpenter.ArchType.AMD64">AMD64</a></code> | x86 based instances. |

---

##### `ARM64` <a name="ARM64" id="cdk-karpenter.ArchType.ARM64"></a>

ARM based instances.

---


##### `AMD64` <a name="AMD64" id="cdk-karpenter.ArchType.AMD64"></a>

x86 based instances.

---


### CapacityType <a name="CapacityType" id="cdk-karpenter.CapacityType"></a>

#### Members <a name="Members" id="Members"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-karpenter.CapacityType.SPOT">SPOT</a></code> | Spot capacity. |
| <code><a href="#cdk-karpenter.CapacityType.ON_DEMAND">ON_DEMAND</a></code> | On demand capacity. |

---

##### `SPOT` <a name="SPOT" id="cdk-karpenter.CapacityType.SPOT"></a>

Spot capacity.

---


##### `ON_DEMAND` <a name="ON_DEMAND" id="cdk-karpenter.CapacityType.ON_DEMAND"></a>

On demand capacity.

---

