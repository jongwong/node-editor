import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';
// 可选：自定义 Babel 插件
const babel = require('@rollup/plugin-babel');
import Buffer from 'buffer';
import * as fs from 'fs';
const { DefinePlugin } = require('@rspack/core');

function rawTxtPlugin() {
	return {
		name: 'vite-plugin-raw-txt',
		transform(src, id) {
			if (id.endsWith('.txt')) {
				const filePath = path.resolve(id);
				const content = fs.readFileSync(filePath, 'utf-8');
				return {
					code: `export default ${JSON.stringify(content)}`,
					map: null, // 如果需要源映射，可以生成源映射
				};
			}
		},
	};
}

export default defineConfig({
	mode: 'development',
	server: {
		port: 3000,
		host: '0.0.0.0',
	},

	plugins: [
		new ProvidePlugin({
			process: [require.resolve('process/browser')],
		}),
		react(), // 代替 ReactRefreshWebpackPlugin
		monacoEditorPlugin({
			// 代替 MonacoWebpackPlugin
			languageWorkers: ['editorWorkerService', 'typescript'],
		}),
		rawTxtPlugin(),
	],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@containers': path.resolve(__dirname, './src/containers'),
			'@public': path.resolve(__dirname, './public'),
		},
	},
	css: {
		preprocessorOptions: {
			less: {
				modifyVars: {
					'primary-color': '#1DA57A', // Antd主题变量
				},
				javascriptEnabled: true, // 支持 JS
			},
		},
		modules: {
			generateScopedName: '[name]__[local]--[hash:base64:4]',
		},
	},
	build: {
		outDir: 'dist',
		assetsDir: 'static', // 资源文件目录
		rollupOptions: {
			output: {
				assetFileNames: 'static/[name].[hash][extname]',
				chunkFileNames: 'static/js/[name].[hash].js',
				entryFileNames: 'static/js/[name].[hash].js',
			},
		},
	},
	define: {
		// 如果需要使用 process.env 变量，可以在这里添加
		'process.env': JSON.stringify(process.env),
		global: {},
		Buffer: Buffer, // 提供 Buffer
	},
});
