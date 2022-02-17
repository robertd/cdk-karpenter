# API Reference <a name="API Reference" id="api-reference"></a>

## Constructs <a name="Constructs" id="constructs"></a>

### Karpenter <a name="cdk-karpenter.Karpenter" id="cdkkarpenterkarpenter"></a>

This construct adds Karpenter to an existing EKS cluster following the guide: https://karpenter.sh/docs/getting-started/ It creates two IAM roles and then adds and configures Karpenter on the cluster with a default provisioner. Additionally, it tags subnets with custom tags that is used for instructing Karpenter where to place the nodes.

#### Initializers <a name="cdk-karpenter.Karpenter.Initializer" id="cdkkarpenterkarpenterinitializer"></a>

```typescript
import { Karpenter } from 'cdk-karpenter'

new Karpenter(scope: Construct, id: string, props: KarpenterProps)
```

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`scope`](#cdkkarpenterkarpenterparameterscope)<span title="Required">*</span> | [`constructs.Construct`](#constructs.Construct) | *No description.* |
| [`id`](#cdkkarpenterkarpenterparameterid)<span title="Required">*</span> | `string` | *No description.* |
| [`props`](#cdkkarpenterkarpenterparameterprops)<span title="Required">*</span> | [`cdk-karpenter.KarpenterProps`](#cdk-karpenter.KarpenterProps) | *No description.* |

---

##### `scope`<sup>Required</sup> <a name="cdk-karpenter.Karpenter.parameter.scope" id="cdkkarpenterkarpenterparameterscope"></a>

- *Type:* [`constructs.Construct`](#constructs.Construct)

---

##### `id`<sup>Required</sup> <a name="cdk-karpenter.Karpenter.parameter.id" id="cdkkarpenterkarpenterparameterid"></a>

- *Type:* `string`

---

##### `props`<sup>Required</sup> <a name="cdk-karpenter.Karpenter.parameter.props" id="cdkkarpenterkarpenterparameterprops"></a>

- *Type:* [`cdk-karpenter.KarpenterProps`](#cdk-karpenter.KarpenterProps)

---



#### Properties <a name="Properties" id="properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`karpenterControllerRole`](#cdkkarpenterkarpenterpropertykarpentercontrollerrole)<span title="Required">*</span> | [`aws-cdk-lib.aws_iam.Role`](#aws-cdk-lib.aws_iam.Role) | *No description.* |
| [`karpenterHelmChart`](#cdkkarpenterkarpenterpropertykarpenterhelmchart)<span title="Required">*</span> | [`aws-cdk-lib.aws_eks.HelmChart`](#aws-cdk-lib.aws_eks.HelmChart) | *No description.* |
| [`karpenterNodeRole`](#cdkkarpenterkarpenterpropertykarpenternoderole)<span title="Required">*</span> | [`aws-cdk-lib.aws_iam.Role`](#aws-cdk-lib.aws_iam.Role) | *No description.* |

---

##### `karpenterControllerRole`<sup>Required</sup> <a name="cdk-karpenter.Karpenter.property.karpenterControllerRole" id="cdkkarpenterkarpenterpropertykarpentercontrollerrole"></a>

```typescript
public readonly karpenterControllerRole: Role;
```

- *Type:* [`aws-cdk-lib.aws_iam.Role`](#aws-cdk-lib.aws_iam.Role)

---

##### `karpenterHelmChart`<sup>Required</sup> <a name="cdk-karpenter.Karpenter.property.karpenterHelmChart" id="cdkkarpenterkarpenterpropertykarpenterhelmchart"></a>

```typescript
public readonly karpenterHelmChart: HelmChart;
```

- *Type:* [`aws-cdk-lib.aws_eks.HelmChart`](#aws-cdk-lib.aws_eks.HelmChart)

---

##### `karpenterNodeRole`<sup>Required</sup> <a name="cdk-karpenter.Karpenter.property.karpenterNodeRole" id="cdkkarpenterkarpenterpropertykarpenternoderole"></a>

```typescript
public readonly karpenterNodeRole: Role;
```

- *Type:* [`aws-cdk-lib.aws_iam.Role`](#aws-cdk-lib.aws_iam.Role)

---


## Structs <a name="Structs" id="structs"></a>

### KarpenterProps <a name="cdk-karpenter.KarpenterProps" id="cdkkarpenterkarpenterprops"></a>

#### Initializer <a name="[object Object].Initializer" id="object-objectinitializer"></a>

```typescript
import { KarpenterProps } from 'cdk-karpenter'

const karpenterProps: KarpenterProps = { ... }
```

#### Properties <a name="Properties" id="properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`cluster`](#cdkkarpenterkarpenterpropspropertycluster)<span title="Required">*</span> | [`aws-cdk-lib.aws_eks.Cluster`](#aws-cdk-lib.aws_eks.Cluster) | The Cluster on which Karpenter needs to be added. |
| [`vpc`](#cdkkarpenterkarpenterpropspropertyvpc)<span title="Required">*</span> | [`aws-cdk-lib.aws_ec2.IVpc`](#aws-cdk-lib.aws_ec2.IVpc) | VPC. |
| [`provisionerConfig`](#cdkkarpenterkarpenterpropspropertyprovisionerconfig) | [`cdk-karpenter.ProvisionerProps`](#cdk-karpenter.ProvisionerProps) | Default provisioner customization. |
| [`subnets`](#cdkkarpenterkarpenterpropspropertysubnets) | [`aws-cdk-lib.aws_ec2.ISubnet`](#aws-cdk-lib.aws_ec2.ISubnet)[] | The VPC subnets which need to be tagged for Karpenter to find them. |
| [`tags`](#cdkkarpenterkarpenterpropspropertytags) | {[ key: string ]: `string`} | Tags will be added to every EC2 instance launched by the default provisioner. |

---

##### `cluster`<sup>Required</sup> <a name="cdk-karpenter.KarpenterProps.property.cluster" id="cdkkarpenterkarpenterpropspropertycluster"></a>

```typescript
public readonly cluster: Cluster;
```

- *Type:* [`aws-cdk-lib.aws_eks.Cluster`](#aws-cdk-lib.aws_eks.Cluster)

The Cluster on which Karpenter needs to be added.

---

##### `vpc`<sup>Required</sup> <a name="cdk-karpenter.KarpenterProps.property.vpc" id="cdkkarpenterkarpenterpropspropertyvpc"></a>

```typescript
public readonly vpc: IVpc;
```

- *Type:* [`aws-cdk-lib.aws_ec2.IVpc`](#aws-cdk-lib.aws_ec2.IVpc)

VPC.

---

##### `provisionerConfig`<sup>Optional</sup> <a name="cdk-karpenter.KarpenterProps.property.provisionerConfig" id="cdkkarpenterkarpenterpropspropertyprovisionerconfig"></a>

```typescript
public readonly provisionerConfig: ProvisionerProps;
```

- *Type:* [`cdk-karpenter.ProvisionerProps`](#cdk-karpenter.ProvisionerProps)

Default provisioner customization.

---

##### `subnets`<sup>Optional</sup> <a name="cdk-karpenter.KarpenterProps.property.subnets" id="cdkkarpenterkarpenterpropspropertysubnets"></a>

```typescript
public readonly subnets: ISubnet[];
```

- *Type:* [`aws-cdk-lib.aws_ec2.ISubnet`](#aws-cdk-lib.aws_ec2.ISubnet)[]

The VPC subnets which need to be tagged for Karpenter to find them.

If left blank it will private VPC subnets will be selected by default.

---

##### `tags`<sup>Optional</sup> <a name="cdk-karpenter.KarpenterProps.property.tags" id="cdkkarpenterkarpenterpropspropertytags"></a>

```typescript
public readonly tags: {[ key: string ]: string};
```

- *Type:* {[ key: string ]: `string`}

Tags will be added to every EC2 instance launched by the default provisioner.

---

### ProvisionerProps <a name="cdk-karpenter.ProvisionerProps" id="cdkkarpenterprovisionerprops"></a>

#### Initializer <a name="[object Object].Initializer" id="object-objectinitializer"></a>

```typescript
import { ProvisionerProps } from 'cdk-karpenter'

const provisionerProps: ProvisionerProps = { ... }
```

#### Properties <a name="Properties" id="properties"></a>

| **Name** | **Type** | **Description** |
| --- | --- | --- |
| [`archTypes`](#cdkkarpenterprovisionerpropspropertyarchtypes) | [`cdk-karpenter.ArchType`](#cdk-karpenter.ArchType)[] | Architecture type of the node instances. |
| [`capacityTypes`](#cdkkarpenterprovisionerpropspropertycapacitytypes) | [`cdk-karpenter.CapacityType`](#cdk-karpenter.CapacityType)[] | Capacity type of the node instances. |
| [`instanceTypes`](#cdkkarpenterprovisionerpropspropertyinstancetypes) | [`aws-cdk-lib.aws_ec2.InstanceType`](#aws-cdk-lib.aws_ec2.InstanceType)[] | The instance types to use in the default Karpenter provider. |
| [`ttlSecondsAfterEmpty`](#cdkkarpenterprovisionerpropspropertyttlsecondsafterempty) | [`aws-cdk-lib.Duration`](#aws-cdk-lib.Duration) | Time in seconds in which nodes will scale down due to low utilization i.e. Duration.minutes(30). |
| [`ttlSecondsUntilExpired`](#cdkkarpenterprovisionerpropspropertyttlsecondsuntilexpired) | [`aws-cdk-lib.Duration`](#aws-cdk-lib.Duration) | Time in seconds in which ndoes will expire and get replaced i.e. Duration.hours(12). |

---

##### `archTypes`<sup>Optional</sup> <a name="cdk-karpenter.ProvisionerProps.property.archTypes" id="cdkkarpenterprovisionerpropspropertyarchtypes"></a>

```typescript
public readonly archTypes: ArchType[];
```

- *Type:* [`cdk-karpenter.ArchType`](#cdk-karpenter.ArchType)[]
- *Default:* amd64

Architecture type of the node instances.

---

##### `capacityTypes`<sup>Optional</sup> <a name="cdk-karpenter.ProvisionerProps.property.capacityTypes" id="cdkkarpenterprovisionerpropspropertycapacitytypes"></a>

```typescript
public readonly capacityTypes: CapacityType[];
```

- *Type:* [`cdk-karpenter.CapacityType`](#cdk-karpenter.CapacityType)[]
- *Default:* spot

Capacity type of the node instances.

---

##### `instanceTypes`<sup>Optional</sup> <a name="cdk-karpenter.ProvisionerProps.property.instanceTypes" id="cdkkarpenterprovisionerpropspropertyinstancetypes"></a>

```typescript
public readonly instanceTypes: InstanceType[];
```

- *Type:* [`aws-cdk-lib.aws_ec2.InstanceType`](#aws-cdk-lib.aws_ec2.InstanceType)[]
- *Default:* t3.medium

The instance types to use in the default Karpenter provider.

---

##### `ttlSecondsAfterEmpty`<sup>Optional</sup> <a name="cdk-karpenter.ProvisionerProps.property.ttlSecondsAfterEmpty" id="cdkkarpenterprovisionerpropspropertyttlsecondsafterempty"></a>

```typescript
public readonly ttlSecondsAfterEmpty: Duration;
```

- *Type:* [`aws-cdk-lib.Duration`](#aws-cdk-lib.Duration)
- *Default:* 30

Time in seconds in which nodes will scale down due to low utilization i.e. Duration.minutes(30).

---

##### `ttlSecondsUntilExpired`<sup>Optional</sup> <a name="cdk-karpenter.ProvisionerProps.property.ttlSecondsUntilExpired" id="cdkkarpenterprovisionerpropspropertyttlsecondsuntilexpired"></a>

```typescript
public readonly ttlSecondsUntilExpired: Duration;
```

- *Type:* [`aws-cdk-lib.Duration`](#aws-cdk-lib.Duration)
- *Default:* 2592000

Time in seconds in which ndoes will expire and get replaced i.e. Duration.hours(12).

---



## Enums <a name="Enums" id="enums"></a>

### ArchType <a name="ArchType" id="archtype"></a>

| **Name** | **Description** |
| --- | --- |
| [`ARM64`](#cdkkarpenterarchtypearm64) | ARM based instances. |
| [`AMD64`](#cdkkarpenterarchtypeamd64) | x86 based instances. |

---

#### `ARM64` <a name="cdk-karpenter.ArchType.ARM64" id="cdkkarpenterarchtypearm64"></a>

ARM based instances.

---


#### `AMD64` <a name="cdk-karpenter.ArchType.AMD64" id="cdkkarpenterarchtypeamd64"></a>

x86 based instances.

---


### CapacityType <a name="CapacityType" id="capacitytype"></a>

| **Name** | **Description** |
| --- | --- |
| [`SPOT`](#cdkkarpentercapacitytypespot) | Spot capacity. |
| [`ON_DEMAND`](#cdkkarpentercapacitytypeondemand) | On demand capacity. |

---

#### `SPOT` <a name="cdk-karpenter.CapacityType.SPOT" id="cdkkarpentercapacitytypespot"></a>

Spot capacity.

---


#### `ON_DEMAND` <a name="cdk-karpenter.CapacityType.ON_DEMAND" id="cdkkarpentercapacitytypeondemand"></a>

On demand capacity.

---

