const { merge } = require('webpack-merge');
const common = require('./webpack.common.config.js');
const path = require('path');
const { spawn } = require('child_process');

const override = {
  mode: 'development',
  watch: true,
  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    stats: {
      colors: true,
      chunks: false,
      children: false
    },
    before() {
      spawn(
        'electron',
        ['--inspect=5858', '.'],
        { shell: true, env: process.env, stdio: 'inherit' }
      )
        .on('close', code => process.exit(0))
        .on('error', spawnError => console.error(spawnError))
    }
  }
};

module.exports = common.map(config => merge(config, override));
