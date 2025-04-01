const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const FontPreloadPlugin = require('webpack-font-preload-plugin');
const { merge } = require('webpack-merge');
const modules = require('./v8-snapshot-tools/modules-to-snapshot.json');
const { DefinePlugin } = require('webpack');

const externals = {};
modules.forEach((curr) => externals[curr] = `require('${curr}')`);

const baseConfig = {
  experiments: {
    topLevelAwait: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    fallback: {
      crypto: false
    },
  },
  output: {
    path: path.resolve(__dirname, 'build'),
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader'
        ],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          'style-loader',
          // Translates CSS into CommonJS
          'css-loader',
          // Compiles Sass to CSS
          'sass-loader',
        ],
      },
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: [{
          loader: 'babel-loader',
          options: {
            plugins: [
              '@babel/plugin-proposal-class-properties'
            ]
          }
        }],
      },
      {
        test: /\.(jpe?g|png|gif|ico|eot|svg|ttf|woff|woff2)$/,
        type: 'asset/resource'
      },
    ]
  },
  plugins: [
    new MiniCssExtractPlugin({
      // Options similar to the same options in webpackOptions.output
      // both options are optional
      filename: '[name].css',
      chunkFilename: '[id].css'
    }),
  ],
};

if (process.env.IS_BETA === 'true') {
  const envPlugin = new DefinePlugin({
    'process.env.IS_BETA': JSON.stringify('true'),
  });
  baseConfig.plugins.push(envPlugin);
}

const web = merge(baseConfig, {
  externals,
  devtool: 'cheap-source-map',
  entry: {
    newtab: path.resolve(__dirname, 'src/pages/dashboard'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'newtab.html',
      title: 'Dashboard',
      chunks: ['newtab']
    }),
    new HtmlWebpackPlugin({
      filename: 'empty-page.html',
      title: 'Empty Page',
      chunks: [],
    }),
    new FontPreloadPlugin({
      index: 'newtab.html',
      extensions: ['woff', 'woff2'],
    }),
  ],
  target: 'web',
  output: {
    publicPath: 'browser://',
  }
});

const render = merge(baseConfig, {
  externals,
  devtool: 'cheap-source-map',
  entry: {
    'main-window': path.resolve(__dirname, 'src/render/main-window/main-window.js'),
    'auth-window': path.resolve(__dirname, 'src/render/auth-window/auth-window.js'),
    'new-auth-window': path.resolve(__dirname, 'src/render/new-auth-window/new-auth-window.jsx'),
    'reset-password-window': path.resolve(__dirname, 'src/render/new-auth-window/reset-password-window.jsx'),
    'create-master-password-window': path.resolve(__dirname, 'src/render/master-password-window/create-master-password-window.js'),
    'check-master-password-window': path.resolve(__dirname, 'src/render/master-password-window/check-master-password-window.js'),
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: 'main-window.html',
      chunks: ['main-window'],
      title: `TickOps Browser${process.env.IS_BETA ? ' Beta' : ''}`
    }),
    new HtmlWebpackPlugin({
      filename: 'auth-window.html',
      chunks: ['auth-window'],
      title: 'TickOps Sign In'
    }),
    new HtmlWebpackPlugin({
      filename: 'new-auth-window.html',
      chunks: ['new-auth-window'],
      title: 'TickOps Auth'
    }),
    new HtmlWebpackPlugin({
      filename: 'reset-password-window.html',
      chunks: ['reset-password-window'],
      title: 'TickOps Reset Password'
    }),
    new HtmlWebpackPlugin({
      filename: 'create-master-password-window.html',
      chunks: ['create-master-password-window'],
      title: 'TickOps Browser Welcome'
    }),
    new HtmlWebpackPlugin({
      filename: 'check-master-password-window.html',
      chunks: ['check-master-password-window'],
      title: 'TickOps Browser'
    }),
  ],
  target: 'electron-renderer',
});

const main = merge(baseConfig, {
  externals: {
    'node-fetch': 'require("node-fetch")',
  },
  devtool: 'cheap-source-map',
  node: {
    __dirname: false
  },
  entry: {
    main: path.resolve(__dirname, 'src/main'),
  },
  target: 'electron-main',
});

const preload = merge(baseConfig, {
  devtool: 'cheap-source-map',
  entry: {
    preload: path.resolve(__dirname, 'src/preload'),
    'extensions-preload': path.resolve(__dirname, 'src/preload/extensions-preload.js'),
    'chrome-extensions-tickops/dist/preload': path.join(__dirname, 'node_modules', 'chrome-extensions-tickops', 'dist', 'preload.js')
  },
  target: 'electron-preload',
});

module.exports = [render, preload, web, main];
