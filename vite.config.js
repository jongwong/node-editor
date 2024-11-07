import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import monacoEditorPlugin from 'vite-plugin-monaco-editor';
// 可选：自定义 Babel 插件
import Buffer from 'buffer';
import * as fs from 'fs';

import { createHtmlPlugin } from 'vite-plugin-html';

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
		proxy: {
			// Proxy all requests starting with `/api` to `http://localhost:5000`
			'/preview': {
				target: 'http://localhost:3001',
				changeOrigin: true, // Change the origin to match the target server
				rewrite: path => path,
			},
			'/api': {
				target: 'http://localhost:3001',
				changeOrigin: true, // Change the origin to match the target server
				rewrite: path => path.replace(/^\/api/, ''),
			},
		},
	},

	plugins: [
		react(), // 代替 ReactRefreshWebpackPlugin
		monacoEditorPlugin({
			// 代替 MonacoWebpackPlugin
			languageWorkers: ['editorWorkerService', 'typescript'],
		}),
		rawTxtPlugin(),
		createHtmlPlugin({
			minify: true,
			entry: '/src/index.tsx',
			template: `public/vite.html`,
			filename: 'index.html',
		}),
	],
	resolve: {
		extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
		alias: {
			'@': path.resolve(__dirname, './src'),
			'@containers': path.resolve(__dirname, './src/containers'),
			'@public': path.resolve(__dirname, './public'),
		},
	},
	css: {
		preprocessorOptions: {
			less: {
				javascriptEnabled: true, // 支持 JS
			},
			postcss: {
				plugins: [],
			},
		},
	},
	build: {
		sourcemap: true, // Useful to diagnose issues in production
		minify: false,
	},
	optimizeDeps: {
		include: [
			'react',
			'react-dom',
			'react-router-dom',
			'react-dnd',
			'react-dnd-html5-backend',
			'react-arborist',
		],
	},
	define: {
		// 如果需要使用 process.env 变量，可以在这里添加
		'process.env': JSON.stringify(process.env),
		global: {},
		Buffer: Buffer, // 提供 Buffer
	},
});
