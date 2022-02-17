[![NPM version](https://badge.fury.io/js/cdk-karpenter.svg)](https://badge.fury.io/js/cdk-karpenter)

## cdk-karpenter

```ts
import { InstanceClass, InstanceSize, InstanceType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster, KubernetesVersion, Nodegroup } from 'aws-cdk-lib/aws-eks';
import { Karpenter } from "cdk-karpenter";

...

const vpc = new Vpc(stack, 'Vpc', { natGateways: 1 });

const cluster = new Cluster(stack, 'eks', {
  vpc,
  version: KubernetesVersion.V1_21,
  defaultCapacity: 1,
  defaultCapacityInstance: InstanceType.of(InstanceClass.T3A, InstanceSize.MEDIUM),
});

new Karpenter(stack, 'karpenter', {
  cluster,
  vpc,
});

```