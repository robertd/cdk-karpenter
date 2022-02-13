import { CustomResource, Duration, Stack } from 'aws-cdk-lib';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Runtime, Function, InlineCode } from 'aws-cdk-lib/aws-lambda';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Provider } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import * as path from 'path';
import * as fs from 'fs';

export interface CustomResourceProps {
  /**
   * Subnets 
   */
  subnets: string[];

  /**
   * Cluster tag for Karpenter
   */
  clusterTag: string;
}

export class TagSubnetsCustomResource extends Construct {
  constructor(scope: Construct, id: string, props: CustomResourceProps) {
    super(scope, id);

    props.subnets.filter((subnetId) => {
      if (!subnetId || subnetId === "") {
        throw new Error('Subnet cannot be empty or undefined.');
      }
    });

    const fn = new Function(this, 'Function', {
      handler: 'index.on_event',
      timeout: Duration.minutes(1),
      runtime: Runtime.PYTHON_3_9,
      code: new InlineCode(fs.readFileSync(path.join(__dirname, '../custom-resource/index.py'), { encoding: 'utf-8' })),
      logRetention: RetentionDays.ONE_DAY,
      description: 'Function for tagging clusters for Karpenter.',
    });

    fn.addToRolePolicy(new PolicyStatement({
      actions: [
        'ec2:DescribeSubnets',
        'ec2:CreateTags',
        'ec2:DeleteTags',
      ],
      resources: ['*'],
    }));

    const provider = new Provider(this, 'Provider', {
      onEventHandler: fn,
      logRetention: RetentionDays.ONE_DAY,
    });

    new CustomResource(this, 'Resource', {
      serviceToken: provider.serviceToken,
      properties: {
        stackName: Stack.of(this).stackName,
        ...props,
      },
    });
  }
}