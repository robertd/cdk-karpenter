import { Duration } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { EbsDeviceVolumeType, InstanceClass, InstanceSize, InstanceType } from 'aws-cdk-lib/aws-ec2';
import { AMIFamily, ArchType, Karpenter } from '../src/index';
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
  provider: {
    amiFamily: AMIFamily.AL2,
    tags: {
      Foo: 'Bar',
    },
    blockDeviceMappings: [
      {
        deviceName: 'test',
        ebs: {
          encrypted: true,
          deleteOnTermination: true,
          volumeSize: '100Gi',
          volumeType: EbsDeviceVolumeType.GP3,
          iops: 5000,
          throughput: 1000,
          kmsKeyId: 'arn:aws:kms:us-west-2:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab',
        },
      },
    ],
  },
});

test('has karpenter controller policy', () => {
  Template.fromStack(stack).hasResourceProperties('AWS::IAM::ManagedPolicy', {
    PolicyDocument: {
      Statement: [
        {
          Action: [
            'ec2:CreateLaunchTemplate',
            'ec2:CreateFleet',
            'ec2:RunInstances',
            'ec2:CreateTags',
            'iam:PassRole',
            'ec2:TerminateInstances',
            'ec2:DeleteLaunchTemplate',
            'ec2:DescribeLaunchTemplates',
            'ec2:DescribeInstances',
            'ec2:DescribeSecurityGroups',
            'ec2:DescribeSubnets',
            'ec2:DescribeInstanceTypes',
            'ec2:DescribeInstanceTypeOfferings',
            'ec2:DescribeAvailabilityZones',
            'ssm:GetParameter',
          ],
          Effect: 'Allow',
          Resource: '*',
        },
      ],
      Version: '2012-10-17',
    },
  });
});

test('has karpenter node role', () => {
  Template.fromStack(stack).hasResourceProperties('AWS::IAM::Role', {
    AssumeRolePolicyDocument: {
      Statement: [
        {
          Action: 'sts:AssumeRole',
          Effect: 'Allow',
          Principal: {
            Service: 'ec2.amazonaws.com',
          },
        },
      ],
      Version: '2012-10-17',
    },
    Description: {
      'Fn::Join': [
        '',
        [
          'This is the IAM role Karpenter uses to give compute permissions for ',
          {
            Ref: 'Cluster9EE0221C',
          },
        ],
      ],
    },
  });
});

test('has karpenter controller role', () => {
  Template.fromStack(stack).hasResourceProperties('AWS::IAM::Role', {
    AssumeRolePolicyDocument: {
      Statement: [
        {
          Action: 'sts:AssumeRoleWithWebIdentity',
          Condition: {
            StringEquals: {
              'Fn::GetAtt': [
                'karpenterConditionPlainJsonC2FAD26E',
                'Value',
              ],
            },
          },
          Effect: 'Allow',
          Principal: {
            Federated: {
              Ref: 'ClusterOpenIdConnectProviderE7EB0530',
            },
          },
        },
      ],
      Version: '2012-10-17',
    },
    ManagedPolicyArns: [
      {
        Ref: 'karpenterControllerPolicyA6C7C5DE',
      },
    ],
    Description: {
      'Fn::Join': [
        '',
        [
          'This is the IAM role Karpenter uses to allocate compute for ',
          {
            Ref: 'Cluster9EE0221C',
          },
        ],
      ],
    },
  });
});

test('has an instance profile', () => {
  Template.fromStack(stack).hasResourceProperties('AWS::IAM::InstanceProfile', {
    Roles: [
      {
        Ref: 'karpenterNodeRole086B4B2F',
      },
    ],
    InstanceProfileName: {
      'Fn::Join': [
        '',
        [
          'KarpenterNodeInstanceProfile-',
          {
            Ref: 'Cluster9EE0221C',
          },
        ],
      ],
    },
    Path: '/',
  });
});

test('has default provider', () => {
  Template.fromStack(stack).hasResourceProperties('Custom::AWSCDK-EKS-KubernetesResource', {
    Manifest: {
      'Fn::Join': [
        '',
        [
          '[{"apiVersion":"karpenter.sh/v1alpha5","kind":"Provisioner","metadata":{"name":"default"},"spec":{"requirements":[{"key":"karpenter.sh/capacity-type","operator":"In","values":["spot"]},{"key":"kubernetes.io/arch","operator":"In","values":["amd64"]},{"key":"topology.kubernetes.io/zone","operator":"In","values":["',
          {
            'Fn::Select': [
              0,
              {
                'Fn::GetAZs': '',
              },
            ],
          },
          '","',
          {
            'Fn::Select': [
              1,
              {
                'Fn::GetAZs': '',
              },
            ],
          },
          '"]}],"labels":{"cluster-name":"',
          {
            Ref: 'Cluster9EE0221C',
          },
          '"},"provider":{"subnetSelector":{"karpenter.sh/discovery/',
          {
            Ref: 'Cluster9EE0221C',
          },
          '":"*"},"securityGroupSelector":{"kubernetes.io/cluster/',
          {
            Ref: 'Cluster9EE0221C',
          },
          '":"owned"},"instanceProfile":"KarpenterNodeInstanceProfile-',
          {
            Ref: 'Cluster9EE0221C',
          },
          '"}}}]',
        ],
      ],
    },
  });
});

test('has custom provider', () => {
  Template.fromStack(stack).hasResourceProperties('Custom::AWSCDK-EKS-KubernetesResource', {
    Manifest: {
      'Fn::Join': [
        '',
        [
          '[{"apiVersion":"karpenter.sh/v1alpha5","kind":"Provisioner","metadata":{"name":"custom"},"spec":{"limits":{"resources":{"mem":"1000Gi","cpu":"1"}},"ttlSecondsAfterEmpty":7200,"ttlSecondsUntilExpired":7776000,"requirements":[{"key":"karpenter.sh/capacity-type","operator":"In","values":["spot"]},{"key":"kubernetes.io/arch","operator":"In","values":["amd64","arm64"]},{"key":"topology.kubernetes.io/zone","operator":"In","values":["',
          {
            'Fn::Select': [
              0,
              {
                'Fn::GetAZs': '',
              },
            ],
          },
          '","',
          {
            'Fn::Select': [
              1,
              {
                'Fn::GetAZs': '',
              },
            ],
          },
          '"]},{"key":"node.kubernetes.io/instance-type","operator":"In","values":["m5.large","m5a.large","m6g.large"]},{"key":"node.kubernetes.io/instance-type","operator":"NotIn","values":["g5.large"]}],"labels":{"cluster-name":"',
          {
            Ref: 'Cluster9EE0221C',
          },
          '\",\"billing\":\"my-team\"},\"taints\":[{\"key\":\"example.com/special-taint\",\"effect\":\"NoSchedule\"}],\"provider\":{\"subnetSelector\":{\"karpenter.sh/discovery/',
          {
            Ref: 'Cluster9EE0221C',
          },
          '":"*"},"securityGroupSelector":{"kubernetes.io/cluster/',
          {
            Ref: 'Cluster9EE0221C',
          },
          '":"owned"},"instanceProfile":"KarpenterNodeInstanceProfile-',
          {
            Ref: 'Cluster9EE0221C',
          },
          '\",\"tags\":{\"Foo\":\"Bar\"},\"amiFamily\":\"AL2\",\"blockDeviceMappings\":[{\"deviceName\":\"test\",\"ebs\":{\"encrypted\":true,\"deleteOnTermination\":true,\"volumeSize\":\"100Gi\",\"volumeType\":\"gp3\",\"iops\":5000,\"throughput\":1000,\"kmsKeyId\":\"arn:aws:kms:us-west-2:111122223333:key/1234abcd-12ab-34cd-56ef-1234567890ab\"}}]}}}]',
        ],
      ],
    },
  });
});