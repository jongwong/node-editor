const HtmlWebpackPlugin = require('html-webpack-plugin');
const { resolve } = require('./utils');

const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
console.log(resolve('src/index.js'));
module.exports = {
  mode: 'production',
  performance: {
    hints: false,
    maxAssetSize: 250000,
  },
  output: {
    publicPath: './',
    path: resolve('dist'),
    filename: `js/[name].[fullhash:8].js`,
    chunkFilename: 'js/[name].[chunkhash:8].js',
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: false,
        terserOptions: {
          output: {
            comments: false,
          },
        },
      }),
      new OptimizeCSSAssetsPlugin({}),
    ],
    minimize: true,
    splitChunks: {
      minSize: 500000,
      cacheGroups: {
        vendors: false,
      },
    },
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: resolve('./public/index.html'),
    }),
  ],
};
