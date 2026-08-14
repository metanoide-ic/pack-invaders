const path = require('path');

module.exports = {
  packagerConfig: {
    name: 'Linha Zero',
    executableName: 'linha-zero',
    asar: true,
    // extension-less on purpose: electron-packager appends .ico on Windows
    // and .icns on macOS by itself. Linux has no single-file app icon
    // convention at the packager level — its window icon is set at runtime
    // instead, see electron/main.cjs.
    icon: path.join(__dirname, 'assets/icons/icon'),
    // The Vite build already inlines every runtime dependency (three.js
    // included) into dist/assets/*.js — nothing under node_modules, src,
    // or the repo's tooling is needed to actually run the packaged app.
    // Without this, electron-forge ships the entire devDependency tree
    // (TypeScript, Playwright, electron-forge itself...) inside the
    // shipped build, which is dead weight nobody launching the game needs.
    ignore: [
      /^\/node_modules/,
      /^\/src/,
      /^\/scratchpad/,
      /^\/\.git/,
      /^\/\.vscode/,
      /^\/tsconfig\.json$/,
      /^\/vite\.config\.ts$/,
    ],
  },
  makers: [
    {
      name: '@electron-forge/maker-zip',
    },
  ],
};
