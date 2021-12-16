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

export async function rollupTypes(
  tsconfig: string | undefined,
  appPackageJson: PackageJson
) {
  const tsCompilerOptions = typescriptCompilerOptions(tsconfig);

  // define bailout conditions
  // - when `declaration` is explicitly set to 'false'
  // - when `declarationDir` is not defined (can't clean up all the generated .d.ts files when compiled to dist root)
  // - when `declarationDir` is not a descendant of `dist` (this must be a configuration error, but bailing out just to be safe)
  if (
    tsCompilerOptions.declaration === false ||
    !tsCompilerOptions.declarationDir ||
    !descendantOfDist(tsCompilerOptions.declarationDir)
  ) {
    return;
  }

  // https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html#including-declarations-in-your-npm-package
  const typesEntryPoint =
    appPackageJson.types ||
    appPackageJson.typings ||
    path.join(paths.appDist, 'index.d.ts');

  const config = {
    input: path.join(tsCompilerOptions.declarationDir, 'index.d.ts'),
    output: { file: typesEntryPoint, format: 'es' },
    plugins: [
      dts(),
      del({ hook: 'buildEnd', targets: tsCompilerOptions.declarationDir }),
    ],
  } as RollupOptions & { output: OutputOptions };

  const bundle = await rollup(config);
  await bundle.write(config.output);
}
