const { awscdk, TaskRuntime } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  name: 'cdk-karpenter',
  description: 'Karpenter simplifies Kubernetes infrastructure with the right nodes at the right time.\
  Karpenter automatically launches just the right compute resources to handle your cluster\'s applications.\
  It is designed to let you take full advantage of the cloud with fast and simple compute provisioning for Kubernetes clusters.',
  author: 'Robert Djurasaj',
  authorAddress: 'robert.djurasaj@gmail.com',
  keywords: ['aws', 'karpenter', 'eks', 'kubernetes'],
  defaultReleaseBranch: 'main',
  name: 'cdk-karpenter',
  repositoryUrl: 'https://github.com/robertd/cdk-karpenter.git',
  catalog: {
    twitter: 'rdj84',
    announce: false,
  },
  compat: true,
  stability: 'experimental',
  cdkVersion: '2.60.0',
  workflowNodeVersion: '^18.13.0',
  autoApproveOptions: {
    allowedUsernames: ['cdk-karpenter-automation'],
    secret: 'GITHUB_TOKEN',
  },
  majorVersion: 4,
  autoApproveProjenUpgrades: true,
  projenTokenSecret: 'PROJEN_GITHUB_TOKEN',
  autoApproveUpgrades: true,
  deps: ['aws-cdk-lib', '@aws-cdk/lambda-layer-kubectl-v23', '@aws-cdk/lambda-layer-kubectl-v24', 'lodash@^4'],
  devDeps: ['aws-cdk-lib', '@aws-cdk/lambda-layer-kubectl-v23', '@aws-cdk/lambda-layer-kubectl-v24', '@types/lodash@^4'],
  // deps: [],                /* Runtime dependencies of this module. */
  // devDeps: [],             /* Build dependencies for this module. */
  // packageName: undefined,  /* The "name" in package.json. */
});

const common_exclude = [
  'cdk.out',
  'cdk.context.json',
  'yarn-error.log',
  'coverage',
  'venv',
  '.DS_Store',
  'src/integ.custom-resource.ts',
  'src/integ.karpenter-eks-ephemeral.ts',
  'src/integ.karpenter-eks-extended.ts',
  'src/integ.karpenter-eks.ts',
  'src/integ.karpenter-fargate-extended.ts',
  'src/integ.karpenter-fargate-ephemeral.ts',
  'src/integ.karpenter-fargate.ts',
  'src/integ.karpenter.ts',
  'src/permissions-boundary.ts',
];
project.gitignore.exclude(...common_exclude);

project.synth();