import { InstallCommand } from './getInstallCmd';

export default function getInstallArgs(
  cmd: InstallCommand,
  packages: string[]
) {
  // replace 'package#version' with 'package@version'
  packages = packages.map((pkg) => pkg.replace(/#/, '@'));

  switch (cmd) {
    case 'npm':
      return ['install', ...packages, '--save-dev'];
    case 'yarn':
      return ['add', ...packages, '--dev'];
  }
}
