import * as shell from 'shelljs';

import * as util from '../utils/fixture';
import { execWithCache } from '../utils/shell';

shell.config.silent = false;

const testDir = 'integration';
const fixtureName = 'build-withConfigTs-noRollup';
const stageName = `stage-integration-${fixtureName}`;

describe('integration :: dts build :: dts-config.ts :: noRollup', () => {
  beforeAll(() => {
    util.teardownStage(stageName);
    util.setupStageWithFixture(testDir, stageName, fixtureName);
  });

  it('should compile files into a dist directory', () => {
    const output = execWithCache('node ../dist/index.js build');

    expect(shell.test('-f', 'dist/index.js')).toBeTruthy();
    expect(
      shell.test('-f', 'dist/build-withconfigts-norollup.cjs.development.js')
    ).toBeTruthy();
    expect(
      shell.test('-f', 'dist/build-withconfigts-norollup.cjs.production.min.js')
    ).toBeTruthy();
    expect(
      shell.test('-f', 'dist/build-withconfigts-norollup.esm.js')
    ).toBeTruthy();

    expect(shell.test('-f', 'dist/index.d.ts')).toBeTruthy();

    expect(output.code).toBe(0);
  });

  afterAll(() => {
    util.teardownStage(stageName);
  });
});
