import { Duration } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { InstanceClass, InstanceSize, InstanceType } from 'aws-cdk-lib/aws-ec2';
import { ArchType, Karpenter } from '../src/index';
import { testFixtureCluster } from './util';

const { stack, vpc, cluster } = testFixtureCluster();
const karpenter = new Karpenter(stack, 'karpenter', {
  cluster,
  vpc,
});

karpenter.addProvisioner('default');
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
  tags: {
    Foo: 'Bar',
  },
});

test('integ snapshot validation', () => {
  const template = Template.fromStack(stack);
  expect(template).toMatchSnapshot();
});