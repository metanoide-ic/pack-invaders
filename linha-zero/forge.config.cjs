module.exports = {
  packagerConfig: {
    name: 'Linha Zero',
    executableName: 'linha-zero',
    asar: true,
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
