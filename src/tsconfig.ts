import ts, { CompilerOptions } from 'typescript';
import { paths } from './constants';

export function typescriptCompilerOptions(
  tsconfig: string | undefined
): CompilerOptions {
  const tsconfigPath = tsconfig || paths.tsconfigJson;

  // borrowed from https://github.com/facebook/create-react-app/pull/7248
  const tsconfigJSON = ts.readConfigFile(tsconfigPath, ts.sys.readFile).config;

  // borrowed from https://github.com/ezolenko/rollup-plugin-typescript2/blob/42173460541b0c444326bf14f2c8c27269c4cb11/src/parse-tsconfig.ts#L48
  return ts.parseJsonConfigFileContent(tsconfigJSON, ts.sys, './').options;
}
