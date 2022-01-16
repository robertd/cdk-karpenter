import * as assertions from 'aws-cdk-lib/assertions';
import * as eks from 'aws-cdk-lib/aws-eks';
import { Karpenter } from '../src/index';
import { testFixtureCluster } from './util';

const CLUSTER_VERSION = eks.KubernetesVersion.V1_21;
const { stack, vpc, cluster } = testFixtureCluster();
new Karpenter(stack, 'karpenter', {
  cluster,
  subnets: vpc.privateSubnets,
  k8sVersion: CLUSTER_VERSION,
  availabilityZones: vpc.availabilityZones,
});

test('has controller policy', () => {
  assertions.Template.fromStack(stack).hasResourceProperties('AWS::IAM::Policy', {
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
    PolicyName: 'karpenterControllerPolicyA6C7C5DE',
    Roles: [
      {
        Ref: 'karpenterControllerRole06530798',
      },
    ],
  });
});

test('has controller role', () => {
  assertions.Template.fromStack(stack).hasResourceProperties('AWS::IAM::Role', {
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
    Description: {
      'Fn::Join': [
        '',
        [
          'This is the karpenterControllerRole role Karpenter uses to allocate compute for ',
          {
            Ref: 'Cluster9EE0221C',
          },
        ],
      ],
    },
  });
});

test('has instance profile', () => {
  assertions.Template.fromStack(stack).hasResourceProperties('AWS::IAM::InstanceProfile', {
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

test('has custom helm chart', () => {
  assertions.Template.fromStack(stack).hasResourceProperties('Custom::AWSCDK-EKS-HelmChart', {
    Namespace: 'karpenter',
    Release: 'karpenter',
    Repository: 'https://charts.karpenter.sh',
    Values: {
      'Fn::Join': [
        '',
        [
          '{"controller":{"clusterName":"',
          {
            Ref: 'Cluster9EE0221C',
          },
          '","clusterEndpoint":"',
          {
            'Fn::GetAtt': [
              'Cluster9EE0221C',
              'Endpoint',
            ],
          },
          '"},"serviceAccount":{"annotations":{"ecs.amazonaws.com/role-arn":"',
          {
            'Fn::GetAtt': [
              'karpenterControllerRole06530798',
              'Arn',
            ],
          },
          '"}}}',
        ],
      ],
    },
  });
});

test('has a launch tempalte', () => {
  assertions.Template.fromStack(stack).hasResourceProperties('AWS::EC2::LaunchTemplate', {
    LaunchTemplateData: {
      BlockDeviceMappings: [
        {
          DeviceName: '/dev/xvda',
          Ebs: {
            Encrypted: true,
            VolumeSize: 2,
          },
        },
        {
          DeviceName: '/dev/xvdb',
          Ebs: {
            Encrypted: true,
            VolumeSize: 20,
          },
        },
      ],
      IamInstanceProfile: {
        Arn: {
          'Fn::GetAtt': [
            'karpenterdefaultKarpenterLaunchTemplateProfileD1F07781',
            'Arn',
          ],
        },
      },
      ImageId: {
        Ref: 'SsmParameterValueawsservicebottlerocketawsk8s121x8664latestimageidC96584B6F00A464EAD1953AFF4B05118Parameter',
      },
      SecurityGroupIds: [
        {
          'Fn::GetAtt': [
            'Cluster9EE0221C',
            'ClusterSecurityGroupId',
          ],
        },
      ],
      TagSpecifications: [
        {
          ResourceType: 'instance',
          Tags: [
            {
              Key: 'Name',
              Value: 'Stack/karpenter/defaultKarpenterLaunchTemplate',
            },
          ],
        },
        {
          ResourceType: 'volume',
          Tags: [
            {
              Key: 'Name',
              Value: 'Stack/karpenter/defaultKarpenterLaunchTemplate',
            },
          ],
        },
      ],
      UserData: {
        'Fn::Base64': {
          'Fn::Join': [
            '',
            [
              '\n[settings.kubernetes]\napi-server="',
              {
                'Fn::GetAtt': [
                  'Cluster9EE0221C',
                  'Endpoint',
                ],
              },
              '"\ncluster-certificate="',
              {
                'Fn::GetAtt': [
                  'Cluster9EE0221C',
                  'CertificateAuthorityData',
                ],
              },
              '"\ncluster-name="',
              {
                Ref: 'Cluster9EE0221C',
              },
              '"',
            ],
          ],
        },
      },
    },
    LaunchTemplateName: {
      'Fn::Join': [
        '',
        [
          'defaultKarpenterLaunchTemplate-',
          {
            Ref: 'Cluster9EE0221C',
          },
        ],
      ],
    },
  });
});