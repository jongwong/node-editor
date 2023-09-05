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

	plugins: [
		new HtmlWebpackPlugin({
			template: resolve('./public/index.html'),
		}),
	],
	optimization: {
		// minimize: false,
		splitChunks: {
			chunks: 'all',
			cacheGroups: {
				monaco: {
					idHint: 'monaco', // 单独将 pupu公共库 拆包
					priority: 20, // 权重需大于其它缓存组
					test: /[\/]node_modules[\/](@monaco)[\/]/,
				},
			},
		},
	},
};
