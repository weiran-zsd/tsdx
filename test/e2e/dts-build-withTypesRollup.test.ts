import * as shell from 'shelljs';

import * as util from '../utils/fixture';
import { execWithCache } from '../utils/shell';

shell.config.silent = false;

const testDir = 'e2e';
const fixtureName = 'build-withTypesRollup';
const stageName = `stage-${fixtureName}`;

describe('dts build :: types rollup', () => {
  beforeAll(() => {
    util.teardownStage(stageName);
    util.setupStageWithFixture(testDir, stageName, fixtureName);
  });

  it('should rollup types into dist/index.d.ts', () => {
    const output = execWithCache('node ../dist/index.js build');

    expect(shell.test('-f', 'dist/index.d.ts')).toBeTruthy();

    expect(shell.test('-d', 'dist/types')).toBeFalsy();
    expect(shell.test('-d', 'dist/foo')).toBeFalsy();
    expect(shell.test('-d', 'dist/bar')).toBeFalsy();

    expect(output.code).toBe(0);
  });

  it('should honor --noTypesRollup flag', () => {
    const output = execWithCache('node ../dist/index.js build --noTypesRollup');

    expect(shell.test('-f', 'dist/index.d.ts')).toBeFalsy();

    expect(shell.test('-f', 'dist/types/index.d.ts')).toBeTruthy();
    expect(shell.test('-f', 'dist/types/foo/foo.d.ts')).toBeTruthy();
    expect(shell.test('-f', 'dist/types/bar/bar.d.ts')).toBeTruthy();

    expect(output.code).toBe(0);
  });

  it('should not rollup types when declarationDir points to the dist root', () => {
    shell.sed(
      '-i',
      '"declarationDir": "dist/types"',
      '"declarationDir": "dist"',
      'tsconfig.json'
    );

    const output = execWithCache('node ../dist/index.js build', {
      noCache: true,
    });

    expect(shell.test('-f', 'dist/index.d.ts')).toBeTruthy();
    expect(shell.test('-f', 'dist/foo/foo.d.ts')).toBeTruthy();
    expect(shell.test('-f', 'dist/bar/bar.d.ts')).toBeTruthy();

    expect(output.code).toBe(0);
  });

  afterAll(() => {
    util.teardownStage(stageName);
  });
});
