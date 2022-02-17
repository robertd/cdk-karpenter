const { awscdk } = require('projen');
const project = new awscdk.AwsCdkConstructLibrary({
  name: 'cdk-karpenter',
  description: 'Install Karpenter on an EKS cluster.',
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
  cdkVersion: '2.12.0',
  workflowNodeVersion: '16.14.0',
  autoApproveOptions: {
    allowedUsernames: ['cdk-karpenter-automation'],
    secret: 'GITHUB_TOKEN',
  },
  dependabot: true,
  autoApproveUpgrades: true,
  deps: ['aws-cdk-lib'],
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
  'src/integ.karpenter-fargate.ts',
  'src/integ.karpenter.ts',
];
project.gitignore.exclude(...common_exclude);

project.synth();