const { merge } = require('webpack-merge');
const common = require('./webpack.common.config.js');

const override = {
  mode: 'development',
  devtool: 'source-map',
  stats: {
    colors: true,
    children: false,
    chunks: false,
    modules: false
  },
  experiments: {
    topLevelAwait: true
  }
};

module.exports = common.map(config => merge(config, override));
