const { defineConfig } = require('@rspack/cli');
const path = require('path');
const { rspack, ProvidePlugin } = require('@rspack/core');
const { middlewaresInit } = require('./middlewares');
const express = require('express');
const { ModuleFederationPlugin } = require('@module-federation/enhanced/rspack');
const RefreshPlugin = require('@rspack/plugin-react-refresh');
const cors = require('cors');
const { formatPathname } = require('./utils');
const targets = ['chrome >= 87', 'edge >= 88', 'firefox >= 78', 'safari >= 14'];
module.exports = defineConfig({
	entry: formatPathname('src/main.tsx'), // Your application's entry file
	output: {
		path: path.resolve(__dirname, 'dist'), // Output directory
		filename: 'bundle.js', // Output file
		publicPath: '/', // Public URL to access files in dev mode
	},
	resolve: {
		extensions: ['.js', '.tsx', '.ts', '.json', '.css', '.less'],
		alias: {
			'@': path.resolve(__dirname, 'src'),
			src: path.resolve(__dirname, 'src'),
			'@containers': path.resolve(__dirname, 'src/containers'),
			'@public': path.resolve(__dirname, 'public'),
		},
	},
	module: {
		parser: {
			'css/auto': {
				namedExports: false,
				auto: true,
				localIdentName: '[name]__[local]___[hash:base64:5]',
			},
		},
		rules: [
			{
				test: /\.ttf$/,
				use: ['file-loader'],
			},
			{
				test: /\.svg$/,
				type: 'asset',
			},
			{
				test: /\.txt$/,
				use: [
					{
						loader: 'raw-loader',
					},
				],
			},
			{
				test: /\.(jsx?|tsx?)$/,
				use: [
					{
						loader: 'builtin:swc-loader',
						options: {
							jsc: {
								parser: {
									syntax: 'typescript',
									tsx: true,
								},
								transform: {
									react: {
										runtime: 'automatic',
										development: true,
										refresh: true,
									},
								},
							},
							env: { targets },
						},
					},
				],
			},
			{
				test: /\.module\.(less|css)$/,
				type: 'css/auto', // 👈
				use: ['less-loader'],
			},
			{
				test: /\.less$/,
				type: 'css/auto', // 👈
				use: ['less-loader'],
			},
		],
	},
	plugins: [
		new rspack.HtmlRspackPlugin({
			template: formatPathname('index.html'),
		}),
		new ProvidePlugin({
			process: [require.resolve('process/browser')],
			Buffer: ['buffer', 'Buffer'],
		}),
		new RefreshPlugin(),
	].filter(Boolean),
	mode: 'development', // or 'production' depending on your environment
	experiments: {
		css: true,
	},
	devServer: {
		port: 3001,
		hot: true,
		liveReload: true,
		setupMiddlewares: (middlewares, devServer) => {
			if (!devServer) {
				throw new Error('@rspack/dev-server is not defined');
			}
			// 启用 CORS，允许所有跨域请求
			devServer.app.use(cors());

			// 使用 bodyParser 解析 application/json
			devServer.app.use(express.json());

			// 使用 bodyParser 解析 application/x-www-form-urlencoded
			devServer.app.use(express.urlencoded({ extended: true }));

			middlewaresInit(devServer.app);

			return middlewares;
		},
	},
});
