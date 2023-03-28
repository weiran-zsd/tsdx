import * as shell from 'shelljs';

import * as util from '../utils/fixture';
import { execWithCache } from '../utils/shell';

shell.config.silent = false;

const testDir = 'e2e';
const fixtureName = 'build-multipleEntries';
const stageName = `stage-${fixtureName}`;

describe('dts build :: multiple entries', () => {
  beforeAll(() => {
    util.teardownStage(stageName);
    util.setupStageWithFixture(testDir, stageName, fixtureName);
  });

  it('should compile files into a dist directory', () => {
    const output = execWithCache(
      [
        'node ../dist/index.js build',
        '--entry ./src/index.ts',
        '--entry ./src/returnsFalse.ts',
        '--entry ./src/returnsTrue.ts',
      ].join(' ')
    );

    expect(shell.test('-f', 'dist/index.js')).toBeTruthy();
    expect(shell.test('-f', 'dist/index.cjs.development.js')).toBeTruthy();
    expect(shell.test('-f', 'dist/index.cjs.production.min.js')).toBeTruthy();
    expect(shell.test('-f', 'dist/index.esm.js')).toBeTruthy();
    expect(shell.test('-f', 'dist/index.d.ts')).toBeTruthy();

    expect(shell.test('-f', 'dist/returnsFalse.js')).toBeTruthy();
    expect(
      shell.test('-f', 'dist/returnsFalse.cjs.development.js')
    ).toBeTruthy();
    expect(
      shell.test('-f', 'dist/returnsFalse.cjs.production.min.js')
    ).toBeTruthy();
    expect(shell.test('-f', 'dist/returnsFalse.esm.js')).toBeTruthy();
    expect(shell.test('-f', 'dist/returnsFalse.d.ts')).toBeTruthy();

    expect(shell.test('-f', 'dist/returnsTrue.js')).toBeTruthy();
    expect(
      shell.test('-f', 'dist/returnsTrue.cjs.development.js')
    ).toBeTruthy();
    expect(
      shell.test('-f', 'dist/returnsTrue.cjs.production.min.js')
    ).toBeTruthy();
    expect(shell.test('-f', 'dist/returnsTrue.esm.js')).toBeTruthy();
    expect(shell.test('-f', 'dist/returnsTrue.d.ts')).toBeTruthy();

    expect(output.code).toBe(0);
  });

  afterAll(() => {
    util.teardownStage(stageName);
  });
});
