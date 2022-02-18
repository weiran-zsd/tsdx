import { RollupOptions } from 'rollup';
import * as fs from 'fs-extra';

import { paths } from './constants';
import {
  DtsOptions,
  DtsOptionsInput,
  NormalizedOpts,
  PackageJson,
} from './types';

import { createRollupConfig } from './createRollupConfig';
import logError from './logError';
import { interopRequireDefault } from './utils';

// check for custom dts.config.js
let dtsBuildConfig = {
  rollup(config: RollupOptions, _options: DtsOptions): RollupOptions {
    return config;
  },
};

if (fs.existsSync(paths.appConfigTs)) {
  try {
    require('ts-node').register({
      compilerOptions: {
        module: 'CommonJS',
      },
    });
    dtsBuildConfig = interopRequireDefault(require(paths.appConfigTs)).default;
  } catch (error) {
    logError(error);
    process.exit(1);
  }
} else if (fs.existsSync(paths.appConfigJs)) {
  dtsBuildConfig = require(paths.appConfigJs);
}

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
