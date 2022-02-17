import { Template } from 'aws-cdk-lib/assertions';
import { Karpenter } from '../src/index';
import { testFixtureCluster } from './util';

const { stack, vpc, cluster } = testFixtureCluster();
new Karpenter(stack, 'karpenter', {
  cluster,
  vpc,
});

test('integ snapshot validation', () => {
  const template = Template.fromStack(stack);
  expect(template).toMatchSnapshot();
});

test('has controller policy', () => {
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

test('has controller role', () => {
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

test('has instance profile', () => {
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