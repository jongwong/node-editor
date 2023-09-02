// webpack.dev.js
const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const openBrowser = require('react-dev-utils/openBrowser');
// 合并公共配置，并添加开发环境配置
module.exports = {
	mode: 'development', // 开发模式，不会压缩最终代码
	devServer: {
		port: 3000, // 服务端口号
		compress: false, // gzip压缩，开发环境不开启，提升速度
		// 解决路由跳转404问题
		historyApiFallback: true,
		hot: true,
		open: false,
		onListening: function (devServer) {
			// react-dev-utils openBrowser 比较好用，不会一直重新打开页面
			openBrowser('localhost:3000');
		},
		headers: {
			'Cross-Origin-Embedder-Policy': 'require-corp',
			'Cross-Origin-Opener-Policy': 'same-origin',
		},
		client: {
			logging: 'none',
			overlay: false,
		},
		static: {
			//托管静态资源文件
			directory: path.join(__dirname, '../public'),
		},
	},
	devtool: 'eval-cheap-module-source-map',
	plugins: [
		// 开启react模块热替换插件
		new ReactRefreshWebpackPlugin(),
	],
};
