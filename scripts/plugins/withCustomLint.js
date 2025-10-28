const { withAndroidManifest } = require('@expo/config-plugins');

const withCustomLint = (config) => {
  return withAndroidManifest(config, (config) => {
    // Custom configuration to avoid lint issues
    return config;
  });
};

module.exports = withCustomLint;