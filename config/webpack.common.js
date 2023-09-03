// webpack.base.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const ESLintWebpackPlugin = require('eslint-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const MONACO_DIR = path.resolve(__dirname, '../node_modules/monaco-editor');
const isDev = process.env.NODE_ENV === 'development';
module.exports = {
	// 入口文件
	entry: path.resolve(__dirname, '../src/index.tsx'),
	// 打包文件出口
	output: {
		filename: 'static/js/[name].[chunkhash:8].js', // 每个输出js的名称
		path: path.resolve(__dirname, '../dist'), // 打包的出口文件夹路径
		clean: true, // webpack4需要配置clean-webpack-plugin删除dist文件，webpack5内置了。
		publicPath: '/', // 打包后文件的公共前缀路径
	},
	module: {
		rules: [
			{
				oneOf: [
					{
						test: /\.(ts|tsx)$/,
						include: [path.resolve(__dirname, '../src')],
						use: [/* 'thread-loader', */ 'babel-loader'],
					},
					{ test: /\.m?js/, resolve: { fullySpecified: false } },
					{
						test: /\.txt|\.raw\.tsx$/,
						use: 'raw-loader',
					},
					{
						test: /\.module\.(less|css)$/, //匹配所有的 less 文件
						use: [
							isDev ? 'style-loader' : MiniCssExtractPlugin.loader,

							{
								loader: 'css-loader',
								options: {
									modules: { localIdentName: '[name]__[local]--[hash:base64:4]' }, // 启用 CSS 模块规范
								},
							},
							'postcss-loader',
							{
								loader: 'less-loader',
								options: {
									lessOptions: {
										// 替换antd的变量，去掉 @ 符号即可
										// https://ant.design/docs/react/customize-theme-cn
										modifyVars: {
											'primary-color': '#1DA57A',
										},
										javascriptEnabled: true, // 支持js
									},
								},
							},
						],
					},

					{
						test: /\.(less|css)$/, //匹配所有的 less 文件

						use: [
							isDev ? 'style-loader' : MiniCssExtractPlugin.loader,
							{
								loader: 'css-loader',
								options: {
									modules: false, // 启用 CSS 模块规范
								},
							},
							'postcss-loader',
							{
								loader: 'less-loader',
								options: {
									lessOptions: {
										// 替换antd的变量，去掉 @ 符号即可
										// https://ant.design/docs/react/customize-theme-cn
										modifyVars: {
											'primary-color': '#1DA57A',
										},
										javascriptEnabled: true, // 支持js
									},
								},
							},
						],
					},
					{
						test: /\.(png|jpg|jpeg|gif|svg)$/,
						type: 'asset',
						parser: {
							//转base64的条件
							dataUrlCondition: {
								maxSize: 10 * 1024, // 10kb
							},
						},
						generator: {
							filename: 'static/images/[name].[contenthash:6][ext]',
						},
					},
					{
						test: /\.(woff2?|eot|ttf|otf)$/, // 匹配字体图标文件
						type: 'asset', // type选择asset
						parser: {
							dataUrlCondition: {
								maxSize: 10 * 1024, // 小于10kb转base64位
							},
						},
						generator: {
							filename: 'static/fonts/[name].[contenthash:6][ext]', // 文件输出目录和命名
						},
					},
					{
						test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/, // 匹配媒体文件
						type: 'asset', // type选择asset
						parser: {
							dataUrlCondition: {
								maxSize: 10 * 1024, // 小于10kb转base64位
							},
						},
						generator: {
							filename: 'static/media/[name].[contenthash:6][ext]', // 文件输出目录和命名
						},
					},
				],
			},
		],
	},
	resolve: {
		extensions: ['.js', '.tsx', '.ts', '.json', '.css', '.less'],
		alias: {
			'@': path.resolve(__dirname, '../src'),
			src: path.resolve(__dirname, '../src'),
			'@containers': path.resolve(__dirname, '../src/containers'),
			'@public': path.resolve(__dirname, '../public'),
		},
		fallback: {
			process: require.resolve('process/browser'),
			buffer: require.resolve('buffer'),
			// assert: require.resolve('assert'),
			// buffer: require.resolve('buffer'),
			// console: require.resolve('console-browserify'),
			// constants: require.resolve('constants-browserify'),
			// crypto: require.resolve('crypto-browserify'),
			// domain: require.resolve('domain-browser'),
			// events: require.resolve('events'),
			// http: require.resolve('stream-http'),
			// https: require.resolve('https-browserify'),
			// os: require.resolve('os-browserify/browser'),
			// path: require.resolve('path-browserify'),
			// punycode: require.resolve('punycode'),
			//
			// querystring: require.resolve('querystring-es3'),
			// stream: require.resolve('stream-browserify'),
			// string_decoder: require.resolve('string_decoder'),
			// sys: require.resolve('util'),
			// timers: require.resolve('timers-browserify'),
			// tty: require.resolve('tty-browserify'),
			// url: require.resolve('url'),
			// util: require.resolve('util'),
			// vm: require.resolve('vm-browserify'),
			// zlib: require.resolve('browserify-zlib'),
		},
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env.APP_ENV': JSON.stringify(process.env.APP_ENV),
		}),
		new HtmlWebpackPlugin({
			template: path.resolve(__dirname, '../public/index.html'),
			inject: true,
		}),
		new webpack.ProvidePlugin({
			process: 'process/browser',
			Buffer: ['buffer', 'Buffer'],
		}),
		new MiniCssExtractPlugin({
			filename: '[name].css',
			chunkFilename: '[name].css',
		}),
		new HtmlWebpackPlugin({
			inject: true,
			template: path.resolve('./public/index.html'),
		}),
		new FriendlyErrorsWebpackPlugin(),
		// new ForkTsCheckerWebpackPlugin(),
		new ESLintWebpackPlugin({ lintDirtyModulesOnly: isDev }),
		// 开启react模块热替换插件
		new ReactRefreshWebpackPlugin({ overlay: false }),
		new MonacoWebpackPlugin({
			// available options are documented at https://github.com/Microsoft/monaco-editor-webpack-plugin#options
			languages: ['javascript', 'typescript', 'json'],
		}),
	],
	// 开启webpack持久化存储缓存
	cache: {
		type: 'filesystem', // 使用文件缓存
	},
};
