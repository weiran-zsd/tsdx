import path from 'path';
import dts from 'rollup-plugin-dts';
import del from 'rollup-plugin-delete';
import { OutputOptions, rollup, RollupOptions } from 'rollup';
import { typescriptCompilerOptions } from './tsconfig';
import { PackageJson } from './types';
import { paths } from './constants';
import { resolveApp } from './utils';

function descendantOfDist(declarationDir: string): boolean {
  const relative = path.relative(paths.appDist, resolveApp(declarationDir));
  return (
    Boolean(relative) &&
    !relative.startsWith('..') &&
    !path.isAbsolute(relative)
  );
}

function getTypesEntryPoint(appPackageJson: PackageJson): string | undefined {
  // https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html#including-declarations-in-your-npm-package
  return appPackageJson.types || appPackageJson.typings;
}

export function isTypesRollupEnabled(appPackageJson: PackageJson): boolean {
  return Boolean(getTypesEntryPoint(appPackageJson));
}

export async function rollupTypes(
  tsconfig: string | undefined,
  appPackageJson: PackageJson
) {
  const tsCompilerOptions = typescriptCompilerOptions(tsconfig);
  const declarationDir =
    tsCompilerOptions.declarationDir || path.join('dist', 'types');

  // define bailout conditions
  // - when no 'typings' or 'types' entrypoint is defined in package.json
  // - when tsconfig.json `declaration` is explicitly set to false
  // - when `declarationDir` is not a descendant of `dist` (this must be a configuration error, but bailing out just to be safe)
  if (
    !isTypesRollupEnabled(appPackageJson) ||
    tsCompilerOptions.declaration === false ||
    !descendantOfDist(declarationDir)
  ) {
    return;
  }

  const config = {
    input: path.join(declarationDir, 'index.d.ts'),
    output: { file: getTypesEntryPoint(appPackageJson), format: 'es' },
    plugins: [dts(), del({ hook: 'buildEnd', targets: declarationDir })],
  } as RollupOptions & { output: OutputOptions };

  const bundle = await rollup(config);
  await bundle.write(config.output);
}
