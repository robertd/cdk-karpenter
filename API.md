# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="Constructs"></a>

### Karpenter <a name="Karpenter" id="cdk-karpenter.Karpenter"></a>

This construct adds Karpenter to an existing EKS cluster following the guide: https://karpenter.sh/docs/getting-started/ It creates two IAM roles and then adds and configures Karpenter on the cluster with a default provisioner. Additionally, it tags subnets with custom tags that is used for instructing Karpenter where to place the nodes.

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

---

##### `toString` <a name="toString" id="cdk-karpenter.Karpenter.toString"></a>

```typescript
public toString(): string
```

Returns a string representation of this construct.

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
| <code><a href="#cdk-karpenter.Karpenter.property.karpenterControllerRole">karpenterControllerRole</a></code> | <code>aws-cdk-lib.aws_iam.Role</code> | *No description.* |
| <code><a href="#cdk-karpenter.Karpenter.property.karpenterHelmChart">karpenterHelmChart</a></code> | <code>aws-cdk-lib.aws_eks.HelmChart</code> | *No description.* |
| <code><a href="#cdk-karpenter.Karpenter.property.karpenterNodeRole">karpenterNodeRole</a></code> | <code>aws-cdk-lib.aws_iam.Role</code> | *No description.* |

---

##### `node`<sup>Required</sup> <a name="node" id="cdk-karpenter.Karpenter.property.node"></a>

```typescript
public readonly node: Node;
```

- *Type:* constructs.Node

The tree node.

---

##### `karpenterControllerRole`<sup>Required</sup> <a name="karpenterControllerRole" id="cdk-karpenter.Karpenter.property.karpenterControllerRole"></a>

```typescript
public readonly karpenterControllerRole: Role;
```

- *Type:* aws-cdk-lib.aws_iam.Role

---

##### `karpenterHelmChart`<sup>Required</sup> <a name="karpenterHelmChart" id="cdk-karpenter.Karpenter.property.karpenterHelmChart"></a>

```typescript
public readonly karpenterHelmChart: HelmChart;
```

- *Type:* aws-cdk-lib.aws_eks.HelmChart

---

##### `karpenterNodeRole`<sup>Required</sup> <a name="karpenterNodeRole" id="cdk-karpenter.Karpenter.property.karpenterNodeRole"></a>

```typescript
public readonly karpenterNodeRole: Role;
```

- *Type:* aws-cdk-lib.aws_iam.Role

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
| <code><a href="#cdk-karpenter.KarpenterProps.property.cluster">cluster</a></code> | <code>aws-cdk-lib.aws_eks.Cluster</code> | The Cluster on which Karpenter needs to be added. |
| <code><a href="#cdk-karpenter.KarpenterProps.property.vpc">vpc</a></code> | <code>aws-cdk-lib.aws_ec2.IVpc</code> | VPC. |
| <code><a href="#cdk-karpenter.KarpenterProps.property.provisionerConfig">provisionerConfig</a></code> | <code><a href="#cdk-karpenter.ProvisionerProps">ProvisionerProps</a></code> | Default provisioner customization. |
| <code><a href="#cdk-karpenter.KarpenterProps.property.subnets">subnets</a></code> | <code>aws-cdk-lib.aws_ec2.ISubnet[]</code> | The VPC subnets which need to be tagged for Karpenter to find them. |
| <code><a href="#cdk-karpenter.KarpenterProps.property.tags">tags</a></code> | <code>{[ key: string ]: string}</code> | Tags will be added to every EC2 instance launched by the default provisioner. |

---

##### `cluster`<sup>Required</sup> <a name="cluster" id="cdk-karpenter.KarpenterProps.property.cluster"></a>

```typescript
public readonly cluster: Cluster;
```

- *Type:* aws-cdk-lib.aws_eks.Cluster

The Cluster on which Karpenter needs to be added.

---

##### `vpc`<sup>Required</sup> <a name="vpc" id="cdk-karpenter.KarpenterProps.property.vpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* aws-cdk-lib.aws_ec2.IVpc

VPC.

---

##### `provisionerConfig`<sup>Optional</sup> <a name="provisionerConfig" id="cdk-karpenter.KarpenterProps.property.provisionerConfig"></a>

```typescript
public readonly provisionerConfig: ProvisionerProps;
```

- *Type:* <a href="#cdk-karpenter.ProvisionerProps">ProvisionerProps</a>

Default provisioner customization.

---

##### `subnets`<sup>Optional</sup> <a name="subnets" id="cdk-karpenter.KarpenterProps.property.subnets"></a>

```typescript
public readonly subnets: ISubnet[];
```

- *Type:* aws-cdk-lib.aws_ec2.ISubnet[]

The VPC subnets which need to be tagged for Karpenter to find them.

If left blank it will private VPC subnets will be selected by default.

---

##### `tags`<sup>Optional</sup> <a name="tags" id="cdk-karpenter.KarpenterProps.property.tags"></a>

```typescript
public readonly tags: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: string}

Tags will be added to every EC2 instance launched by the default provisioner.

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

### ProvisionerProps <a name="ProvisionerProps" id="cdk-karpenter.ProvisionerProps"></a>

#### Initializer <a name="Initializer" id="cdk-karpenter.ProvisionerProps.Initializer"></a>

```typescript
import { ProvisionerProps } from 'cdk-karpenter'

const provisionerProps: ProvisionerProps = { ... }
```

#### Properties <a name="Properties" id="Properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| <code><a href="#cdk-karpenter.ProvisionerProps.property.archTypes">archTypes</a></code> | <code><a href="#cdk-karpenter.ArchType">ArchType</a>[]</code> | Architecture type of the node instances. |
| <code><a href="#cdk-karpenter.ProvisionerProps.property.capacityTypes">capacityTypes</a></code> | <code><a href="#cdk-karpenter.CapacityType">CapacityType</a>[]</code> | Capacity type of the node instances. |
| <code><a href="#cdk-karpenter.ProvisionerProps.property.instanceTypes">instanceTypes</a></code> | <code>aws-cdk-lib.aws_ec2.InstanceType[]</code> | The instance types to use in the default Karpenter provider. |
| <code><a href="#cdk-karpenter.ProvisionerProps.property.limits">limits</a></code> | <code><a href="#cdk-karpenter.Limits">Limits</a></code> | CPU and Memory Limits. |
| <code><a href="#cdk-karpenter.ProvisionerProps.property.ttlSecondsAfterEmpty">ttlSecondsAfterEmpty</a></code> | <code>aws-cdk-lib.Duration</code> | Time in seconds in which nodes will scale down due to low utilization i.e. Duration.minutes(30). |
| <code><a href="#cdk-karpenter.ProvisionerProps.property.ttlSecondsUntilExpired">ttlSecondsUntilExpired</a></code> | <code>aws-cdk-lib.Duration</code> | Time in seconds in which ndoes will expire and get replaced i.e. Duration.hours(12). |

---

##### `archTypes`<sup>Optional</sup> <a name="archTypes" id="cdk-karpenter.ProvisionerProps.property.archTypes"></a>

```typescript
public readonly archTypes: ArchType[];
```

- *Type:* <a href="#cdk-karpenter.ArchType">ArchType</a>[]
- *Default:* amd64

Architecture type of the node instances.

---

##### `capacityTypes`<sup>Optional</sup> <a name="capacityTypes" id="cdk-karpenter.ProvisionerProps.property.capacityTypes"></a>

```typescript
public readonly capacityTypes: CapacityType[];
```

- *Type:* <a href="#cdk-karpenter.CapacityType">CapacityType</a>[]
- *Default:* spot

Capacity type of the node instances.

---

##### `instanceTypes`<sup>Optional</sup> <a name="instanceTypes" id="cdk-karpenter.ProvisionerProps.property.instanceTypes"></a>

```typescript
public readonly instanceTypes: InstanceType[];
```

- *Type:* aws-cdk-lib.aws_ec2.InstanceType[]
- *Default:* t3.medium

The instance types to use in the default Karpenter provider.

---

##### `limits`<sup>Optional</sup> <a name="limits" id="cdk-karpenter.ProvisionerProps.property.limits"></a>

```typescript
public readonly limits: Limits;
```

- *Type:* <a href="#cdk-karpenter.Limits">Limits</a>

CPU and Memory Limits.

---

##### `ttlSecondsAfterEmpty`<sup>Optional</sup> <a name="ttlSecondsAfterEmpty" id="cdk-karpenter.ProvisionerProps.property.ttlSecondsAfterEmpty"></a>

```typescript
public readonly ttlSecondsAfterEmpty: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* 30

Time in seconds in which nodes will scale down due to low utilization i.e. Duration.minutes(30).

---

##### `ttlSecondsUntilExpired`<sup>Optional</sup> <a name="ttlSecondsUntilExpired" id="cdk-karpenter.ProvisionerProps.property.ttlSecondsUntilExpired"></a>

```typescript
public readonly ttlSecondsUntilExpired: Duration;
```

- *Type:* aws-cdk-lib.Duration
- *Default:* 2592000

Time in seconds in which ndoes will expire and get replaced i.e. Duration.hours(12).

---



## Enums <a name="Enums" id="Enums"></a>

### ArchType <a name="ArchType" id="cdk-karpenter.ArchType"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-karpenter.ArchType.ARM64">ARM64</a></code> | ARM based instances. |
| <code><a href="#cdk-karpenter.ArchType.AMD64">AMD64</a></code> | x86 based instances. |

---

#### `ARM64` <a name="ARM64" id="cdk-karpenter.ArchType.ARM64"></a>

ARM based instances.

---


#### `AMD64` <a name="AMD64" id="cdk-karpenter.ArchType.AMD64"></a>

x86 based instances.

---


### CapacityType <a name="CapacityType" id="cdk-karpenter.CapacityType"></a>

| **Name** | **Description** |
| --- | --- |
| <code><a href="#cdk-karpenter.CapacityType.SPOT">SPOT</a></code> | Spot capacity. |
| <code><a href="#cdk-karpenter.CapacityType.ON_DEMAND">ON_DEMAND</a></code> | On demand capacity. |

---

#### `SPOT` <a name="SPOT" id="cdk-karpenter.CapacityType.SPOT"></a>

Spot capacity.

---


#### `ON_DEMAND` <a name="ON_DEMAND" id="cdk-karpenter.CapacityType.ON_DEMAND"></a>

On demand capacity.

---

