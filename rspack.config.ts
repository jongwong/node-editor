import { defineConfig } from '@rspack/cli';
import { DefinePlugin, ProvidePlugin, rspack } from '@rspack/core';
import * as RefreshPlugin from '@rspack/plugin-react-refresh';
import * as path from 'path';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const isDev = process.env.NODE_ENV === 'development';
// Target browsers, see: https://github.com/browserslist/browserslist
const targets = ['chrome >= 87', 'edge >= 88', 'firefox >= 78', 'safari >= 14'];

export default defineConfig({
	context: __dirname,
	entry: {
		main: './src/index.tsx',
	},
	experiments: {
		css: true,
	},
	output: {
		globalObject: 'self',
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist'),
	},
	resolve: {
		extensions: ['.js', '.tsx', '.ts', '.json', '.css', '.less'],
		alias: {
			'@': path.resolve(__dirname, 'src'),
			src: path.resolve(__dirname, 'src'),
			'@containers': path.resolve(__dirname, 'src/containers'),
			'@public': path.resolve(__dirname, 'public'),
			'worker-loader': require.resolve('worker-rspack-loader'),
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
										development: isDev,
										refresh: isDev,
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
			template: './public/index.html',
		}),
		new ProvidePlugin({
			process: [require.resolve('process/browser')],
			Buffer: ['buffer', 'Buffer'],
		}),
		new MonacoWebpackPlugin({
			languages: ['typescript', 'javascript', 'json'],
			globalAPI: true,
		}),
		isDev ? new RefreshPlugin() : null,
	].filter(Boolean),
	optimization: {
		minimizer: [
			new rspack.SwcJsMinimizerRspackPlugin(),
			new rspack.LightningCssMinimizerRspackPlugin({
				minimizerOptions: { targets },
			}),
		],
	},
	devServer: {
		port: 3000,
	},
});
