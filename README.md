[![NPM version](https://badge.fury.io/js/cdk-karpenter.svg)](https://badge.fury.io/js/cdk-karpenter)

# cdk-karpenter

Karpenter simplifies Kubernetes infrastructure with the right nodes at the right time. It automatically launches just the right compute resources to handle your cluster's applications. It is designed to let you take full advantage of the cloud with fast and simple compute provisioning for Kubernetes clusters.

More info about Karpenter at: https://karpenter.sh

## Showcase

```ts
import { InstanceClass, InstanceSize, InstanceType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster, KubernetesVersion, Nodegroup } from 'aws-cdk-lib/aws-eks';
import { Karpenter, AMIFamily } from "cdk-karpenter";

...

const vpc = new Vpc(stack, 'Vpc', { natGateways: 1 });

const cluster = new Cluster(stack, 'eks', {
  vpc,
  version: KubernetesVersion.V1_21,
  defaultCapacity: 1,
  defaultCapacityInstance: InstanceType.of(InstanceClass.T3A, InstanceSize.MEDIUM),
});

const karpenter = new Karpenter(stack, 'karpenter', {
  cluster,
  vpc,
});

// default provisioner
karpenter.addProvisioner('default');

// customized provisoner
karpenter.addProvisioner('custom', {
  requirements: {
    archTypes: [ArchType.AMD64, ArchType.ARM64],
    instanceTypes: [
      InstanceType.of(InstanceClass.M5, InstanceSize.LARGE),
      InstanceType.of(InstanceClass.M5A, InstanceSize.LARGE),
      InstanceType.of(InstanceClass.M6G, InstanceSize.LARGE),
    ],
    rejectInstanceTypes: [
      InstanceType.of(InstanceClass.G5, InstanceSize.LARGE),
    ],
  },
  ttlSecondsAfterEmpty: Duration.hours(2),
  ttlSecondsUntilExpired: Duration.days(90),
  labels: {
    billing: 'my-team',
  },
  taints: [
    {
      key: 'example.com/special-taint',
      effect: 'NoSchedule',
    },
  ],
  limits: {
    cpu: '1',
    mem: '1000Gi',
  },
  provider: {
    amiFamily: AMIFamily.AL2,
    tags: {
      Foo: 'Bar',
    },
  },
});
```

## Docs

[API.md](./API.md)