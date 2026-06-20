// metro.config.js — pnpm workspace compatible.
//
// pnpm hoists deps into a virtual store (node_modules/.pnpm) at the workspace
// root with symlinks at each package's node_modules. Metro needs:
//   (a) symlink support so it can follow pnpm's symlinks
//   (b) watchFolders covering the workspace root to see all packages
//   (c) nodeModulesPaths for direct resolution fallback
//
// NOTE: disableHierarchicalLookup must remain false (default) so Metro can
// walk into pnpm's virtual store and find each package's local transitive deps
// (e.g. @babel/runtime sitting inside node_modules/.pnpm/expo-router.../node_modules/).

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// Enable symlink resolution so Metro follows pnpm's virtual store symlinks.
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
