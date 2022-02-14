import { DtsOptions, RollupOptions } from '../src';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import postcss from 'rollup-plugin-postcss';

// This is necessary due to how typechecking works with the @types/cssnano
// package. If you remove the `if` check below and attempt to add the cssnano
// processor directly, you run into issues with type stack depth.
const getPlugins = () => {
  const plugins: any[] = [autoprefixer()];
  const cssnanoProcessor = cssnano({ preset: 'default' });
  if ('version' in cssnanoProcessor) {
    plugins.push(cssnanoProcessor);
  }
  return plugins;
};

export default {
  rollup(config: RollupOptions, options: DtsOptions) {
    config?.plugins?.push(
      postcss({
        plugins: getPlugins(),
        inject: false,
        // only write out CSS for the first bundle (avoids pointless extra files):
        extract: !!options.writeMeta,
      })
    );
    return config;
  },
};
