import { RollupOptions } from 'rollup';
import * as fs from 'fs-extra';
import chalk from 'chalk';

import { paths } from './constants';
import {
  DtsConfig,
  DtsOptions,
  DtsOptionsInput,
  NormalizedDtsConfig,
  NormalizedOpts,
  PackageJson,
} from './types';

import { createRollupConfig } from './createRollupConfig';
import logError from './logError';
import { interopRequireDefault } from './utils';
import { configDefaults } from './defaults';

export async function createBuildConfigs(
  opts: NormalizedOpts,
  appPackageJson: PackageJson
): Promise<Array<RollupOptions>> {
  const allInputs = createAllFormats(opts).map(
    (options: DtsOptions, index: number) => ({
      ...options,
      // We want to know if this is the first run for each entryfile
      // for certain plugins (e.g. css)
      writeMeta: index === 0,
    })
  );

  // check for custom dts.config.ts/dts.config.js
  const dtsBuildConfig: NormalizedDtsConfig = getNormalizedDtsConfig();

  return await Promise.all(
    allInputs.map(async (options: DtsOptions, index: number) => {
      // pass the full rollup config to dts-cli.config.js override
      const config = await createRollupConfig(appPackageJson, options, index);
      return dtsBuildConfig.rollup(config, options);
    })
  );
}

function createAllFormats(opts: NormalizedOpts): [DtsOptions, ...DtsOptions[]] {
  const sharedOpts: Omit<DtsOptions, 'format' | 'env'> = {
    ...opts,
    // for multi-entry, we use an input object to specify where to put each
    // file instead of output.file
    input: opts.input.reduce((dict: DtsOptionsInput, input, index) => {
      dict[`${opts.output.file[index]}`] = input;
      return dict;
    }, {}),
    // multiple UMD names aren't currently supported for multi-entry
    // (can't code-split UMD anyway)
    name: Array.isArray(opts.name) ? opts.name[0] : opts.name,
  };

  return [
    opts.format.includes('cjs') && {
      ...sharedOpts,
      format: 'cjs',
      env: 'development',
    },
    opts.format.includes('cjs') && {
      ...sharedOpts,
      format: 'cjs',
      env: 'production',
    },
    opts.format.includes('esm') && { ...sharedOpts, format: 'esm' },
    opts.format.includes('umd') && {
      ...sharedOpts,
      format: 'umd',
      env: 'development',
    },
    opts.format.includes('umd') && {
      ...sharedOpts,
      format: 'umd',
      env: 'production',
    },
    opts.format.includes('system') && {
      ...sharedOpts,
      format: 'system',
      env: 'development',
    },
    opts.format.includes('system') && {
      ...sharedOpts,
      format: 'system',
      env: 'production',
    },
  ].filter(Boolean) as [DtsOptions, ...DtsOptions[]];
}

function getNormalizedDtsConfig(): NormalizedDtsConfig {
  const dtsConfig = getDtsConfig();

  if (!dtsConfig.rollup) {
    console.log(
      chalk.yellow(
        'rollup configuration not provided. Using default no-op configuration.'
      )
    );
  }

  return {
    ...dtsConfig,
    rollup: dtsConfig.rollup ?? configDefaults.rollup,
  };
}

function getDtsConfig(): DtsConfig {
  // check for custom dts.config.js
  let dtsConfig: any = configDefaults;

  if (fs.existsSync(paths.appConfigTs)) {
    dtsConfig = loadDtsConfigTs();
  } else if (fs.existsSync(paths.appConfigJs)) {
    dtsConfig = loadDtsConfigJs();
  } else if (fs.existsSync(paths.appConfigCjs)) {
    dtsConfig = loadDtsConfigCjs();
  }

  return isDtsConfig(dtsConfig) ? dtsConfig : configDefaults;
}

// This can return undefined if they don't export anything in
// dts.config.ts
function loadDtsConfigTs(): DtsConfig | undefined {
  try {
    require('ts-node').register({
      compilerOptions: {
        module: 'CommonJS',
      },
    });
    return interopRequireDefault(require(paths.appConfigTs)).default;
  } catch (error) {
    logError(error);
    process.exit(1);
  }
}

// This can return undefined if they don't export anything in
// dts.config.js
function loadDtsConfigJs(): DtsConfig | undefined {
  // babel-node could easily be injected here if so desired.
  return require(paths.appConfigJs);
}

function loadDtsConfigCjs(): DtsConfig | undefined {
  return require(paths.appConfigCjs);
}

function isDtsConfig(required: any): required is DtsConfig {
  return isDefined(required) && isDefined(required);
}

function isDefined<T>(required: T | undefined | null): required is T {
  return required !== null && required !== undefined;
}
