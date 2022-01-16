import { App, Stack } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Cluster, ClusterProps, KubernetesVersion } from 'aws-cdk-lib/aws-eks';

const CLUSTER_VERSION = KubernetesVersion.V1_21;

export function testFixture() {
  const app = new App();
  const stack = new Stack(app, 'Stack', { env: { region: 'us-west-2' } });
  const vpc = new ec2.Vpc(stack, 'VPC');

  return { stack, vpc, app };
}

export function testFixtureCluster(props: Omit<ClusterProps, 'version'> = {}) {
  const { stack, vpc, app } = testFixture();
  const cluster = new Cluster(stack, 'Cluster', {
    version: CLUSTER_VERSION,
    vpc,
    prune: false, // mainly because this feature was added later and we wanted to avoid having to update all test expectations....
    ...props,
  });

  return { stack, app, vpc, cluster };
}