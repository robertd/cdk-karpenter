[![NPM version](https://badge.fury.io/js/cdk-karpenter.svg)](https://badge.fury.io/js/cdk-karpenter)

# cdk-karpenter

Karpenter simplifies Kubernetes infrastructure with the right nodes at the right time. It automatically launches just the right compute resources to handle your cluster's applications. It is designed to let you take full advantage of the cloud with fast and simple compute provisioning for Kubernetes clusters.

More info about Karpenter at: https://karpenter.sh

Karpenter Best Practices: https://aws.github.io/aws-eks-best-practices/karpenter/

Karpenter version: v0.20.0

Notes: 
- As of v0.16.0 changed the default replicas from 1 to 2. See: https://github.com/aws/karpenter/blob/main/website/content/en/v0.16.1/troubleshooting.md
- Prior to v0.20.0, Karpenter would prioritize certain instance type categories absent of any requirements in the Provisioner. v0.20.0+ removes prioritizing these instance type categories (“m”, “c”, “r”, “a”, “t”, “i”) in code. Bare Metal and GPU instance types are still deprioritized and only used if no other instance types are compatible with the node requirements. This means that, now, you will need to explicitly define the instance types, sizes or categories you want to allow in your Provisioner; otherwise, it is possible that you receive more exotic instance types.

## Showcase

```ts
import { InstanceClass, InstanceSize, InstanceType, EbsDeviceVolumeType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Cluster, KubernetesVersion, Nodegroup } from 'aws-cdk-lib/aws-eks';
import { KubectlV24Layer } from '@aws-cdk/lambda-layer-kubectl-v24';
import { Karpenter, AMIFamily } from "cdk-karpenter";

...

const vpc = new Vpc(stack, 'Vpc', { natGateways: 1 });

const cluster = new Cluster(stack, 'eks', {
  vpc,
  version: KubernetesVersion.V1_24,
  kubectlLayer: new KubectlV24Layer(stack, 'kubectl'),
  defaultCapacity: 1,
  defaultCapacityInstance: InstanceType.of(InstanceClass.T3A, InstanceSize.MEDIUM),
});

const karpenter = new Karpenter(stack, 'karpenter', {
  cluster,
  vpc,
});

// default provisioner
karpenter.addProvisioner('default');
//Note: Default provisioner has no cpu/mem limits, nor will cleanup provisioned resources. Use with caution.
// see: https://karpenter.sh/v0.20.0/provisioner/#node-deprovisioning

// custom provisoner - kitchen sink
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
  ttlSecondsAfterEmpty: Duration.hours(1),
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
  startupTaints: [
    {
      key: 'example.com/another-taint',
      effect: 'NoSchedule',
    },
  ],
  limits: {
    cpu: '1',
    mem: '1000Gi',
  },
  consolidation: false,
  provider: {
    amiFamily: AMIFamily.AL2,
    amiSelector: {
      'aws-ids': 'ami-123,ami-456',
    },
    tags: {
      Foo: 'Bar',
    },
    launchTemplate: 'MyLaunchTemplate',
    blockDeviceMappings: [
      {
        deviceName: 'test',
        ebs: {
          encrypted: true,
          deleteOnTermination: true,
          volumeSize: '100Gib',
          volumeType: EbsDeviceVolumeType.GP3,
          iops: 5000,
          throughput: 1000,
          kmsKeyId: 'arn:aws:kms:us-west-2:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab',
        },
      },
    ],
  },
});
```

## Docs

[API.md](./API.md)