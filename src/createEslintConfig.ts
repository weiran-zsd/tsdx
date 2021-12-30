import fs from 'fs-extra';
import path from 'path';
import { Linter } from 'eslint';
import { PackageJson } from './types';
import { getReactVersion } from './utils';
interface CreateEslintConfigArgs {
  pkg: PackageJson;
  rootDir: string;
  writeFile: boolean;
}
export async function createEslintConfig({
  pkg,
  rootDir,
  writeFile,
}: CreateEslintConfigArgs): Promise<Linter.Config | void> {
  const isReactLibrary = Boolean(getReactVersion(pkg));

  const config = {
    extends: [
      path.join(__dirname, '../conf/eslint-config-react-app/index.js'),
      'prettier',
      'plugin:prettier/recommended',
    ],
    settings: {
      react: {
        // Fix for https://github.com/jaredpalmer/tsdx/issues/279
        version: isReactLibrary ? 'detect' : '999.999.999',
      },
    },
  };

  if (!writeFile) {
    return config;
  }

  const file = path.join(rootDir, '.eslintrc.js');
  // if the path is an abs path(e.g. "/Users/user/my-project/.eslintrc.js"),
  // need to convert a rel path to app root.
  config.extends = config.extends.map((it) =>
    /^\//u.test(it) ? path.relative(rootDir, it) : it
  );
  try {
    await fs.writeFile(
      file,
      `module.exports = ${JSON.stringify(config, null, 2)}`,
      { flag: 'wx' }
    );
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'EEXIST') {
      console.error(
        'Error trying to save the Eslint configuration file:',
        `${file} already exists.`
      );
    } else {
      console.error(e);
    }

    return config;
  }
}
