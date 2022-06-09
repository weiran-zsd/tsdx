import { NormalizedDtsConfig } from './types';

export const configDefaults: NormalizedDtsConfig = Object.freeze({
  rollup: (config: any) => config,
});
