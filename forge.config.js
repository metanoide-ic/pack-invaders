module.exports = {
  packagerConfig: {
    name: 'Pack Invaders',
    executableName: 'pack-invaders',
    asar: true,
  },
  makers: [
    {
      name: '@electron-forge/maker-zip',
    },
  ],
};
