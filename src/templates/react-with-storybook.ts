import { Template } from './template';
import reactTemplate from './react';
import { PackageJson } from 'type-fest';

const storybookTemplate: Template = {
  dependencies: [
    ...reactTemplate.dependencies,
    '@babel/core',
    'storybook#next',
    "@storybook/addon-essentials#next",
    "@storybook/addon-info#next",
    "@storybook/addon-links#next",
    "@storybook/addons#next",
    "@storybook/react#next",
    "@storybook/react-vite#next",
    "vite",
    'react-is',
    'babel-loader',
    '@tsconfig/vite-react',
  ],
  name: 'react-with-storybook',
  packageJson: {
    ...reactTemplate.packageJson,
    scripts: {
      ...reactTemplate.packageJson.scripts,
      storybook: 'storybook dev -p 6006',
      'build-storybook': 'storybook build',
    } as PackageJson['scripts'],
    jest: {
      testEnvironment: 'jsdom',
    },
  },
};

export default storybookTemplate;
