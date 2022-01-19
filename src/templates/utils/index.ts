import { Template } from '../template';

interface ProjectArgs {
  name: string;
  author: string;
  includeHuskyConfig: boolean;
}
export const composePackageJson =
  (template: Template) =>
  ({ name, author, includeHuskyConfig }: ProjectArgs) => {
    const pkgJson = {
      ...template.packageJson,
      name,
      author,
      module: `dist/${name}.esm.js`,
      'size-limit': [
        {
          path: `dist/${name}.cjs.production.min.js`,
          limit: '10 KB',
        },
        {
          path: `dist/${name}.esm.js`,
          limit: '10 KB',
        },
      ],
    };
    if (!includeHuskyConfig) {
      delete pkgJson.husky;
    }
    return pkgJson;
  };

interface DependencyArgs {
  includeHusky: boolean;
}
export const composeDependencies =
  (template: Template) =>
  ({ includeHusky }: DependencyArgs) => {
    return template.dependencies.filter(
      (dep) => dep !== 'husky' || includeHusky
    );
  };
