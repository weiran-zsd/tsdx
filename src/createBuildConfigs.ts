import { RollupOptions, OutputOptions } from 'rollup';
import * as fs from 'fs-extra';
import { concatAllArray } from 'jpjs';

import { paths } from './constants';
import { DtsOptions, NormalizedOpts, PackageJson } from './types';

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
): Promise<Array<RollupOptions & { output: OutputOptions }>> {
  const allInputs = concatAllArray(
    opts.input.map((input: string) =>
      createAllFormats(opts, input).map(
        (options: DtsOptions, index: number) => ({
          ...options,
          // We want to know if this is the first run for each entryfile
          // for certain plugins (e.g. css)
          writeMeta: index === 0,
        })
      )
    )
  );

  return await Promise.all(
    allInputs.map(async (options: DtsOptions, index: number) => {
      // pass the full rollup config to dts-cli.config.js override
      const config = await createRollupConfig(appPackageJson, options, index);
      return dtsBuildConfig.rollup(config, options);
    })
  );
}

function createAllFormats(
  opts: NormalizedOpts,
  input: string
): [DtsOptions, ...DtsOptions[]] {
  return [
    opts.format.includes('cjs') && {
      ...opts,
      format: 'cjs',
      env: 'development',
      input,
    },
    opts.format.includes('cjs') && {
      ...opts,
      format: 'cjs',
      env: 'production',
      input,
    },
    opts.format.includes('esm') && { ...opts, format: 'esm', input },
    opts.format.includes('umd') && {
      ...opts,
      format: 'umd',
      env: 'development',
      input,
    },
    opts.format.includes('umd') && {
      ...opts,
      format: 'umd',
      env: 'production',
      input,
    },
    opts.format.includes('system') && {
      ...opts,
      format: 'system',
      env: 'development',
      input,
    },
    opts.format.includes('system') && {
      ...opts,
      format: 'system',
      env: 'production',
      input,
    },
  ].filter(Boolean) as [DtsOptions, ...DtsOptions[]];
}
