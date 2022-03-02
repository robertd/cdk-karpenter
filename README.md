[![NPM version](https://badge.fury.io/js/cdk-karpenter.svg)](https://badge.fury.io/js/cdk-karpenter)

# cdk-karpenter

Karpenter simplifies Kubernetes infrastructure with the right nodes at the right time. It automatically launches just the right compute resources to handle your cluster's applications. It is designed to let you take full advantage of the cloud with fast and simple compute provisioning for Kubernetes clusters.

More info about Karpenter at: https://karpenter.sh

## Basic use

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

## Customize default Karpenter provisioner

```ts
new Karpenter(stack, 'karpenter', {
  cluster,
  vpc,
  tags: {
    Foo: 'bar',
  },
  provisionerConfig: {
    instanceTypes: [
      InstanceType.of(InstanceClass.M5, InstanceSize.LARGE),
      InstanceType.of(InstanceClass.M5A, InstanceSize.LARGE),
      InstanceType.of(InstanceClass.M6G, InstanceSize.LARGE),
    ],
    archTypes: [
      ArchType.AMD64,
      ArchType.ARM64,
    ],
    capacityTypes: [
      CapacityType.SPOT,
      CapacityType.ON_DEMAND,
    ],
    ttlSecondsUntilExpired: Duration.days(30),
    ttlSecondsAfterEmpty: Duration.minutes(5),
    limits: {
      cpu: "1",
      mem: "1000Gi",
    },
  },
});
```

## Docs

[API.md](./API.md)