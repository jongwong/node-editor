const path = require('path');

module.exports = {
	env: {
		browser: true,
		es2021: true,
	},
	extends: [
		'airbnb',
		'eslint:recommended',
		'plugin:react/recommended',
		'plugin:@typescript-eslint/recommended',

		'prettier',
		// resolved

		'plugin:import/recommended',

		'plugin:import/typescript',
	],
	parser: '@typescript-eslint/parser',
	plugins: ['react', 'react-hooks', '@typescript-eslint', 'import', 'simple-import-sort'],
	// 解析器选项
	parserOptions: {
		// 启用 ES6 语法支持
		ecmaVersion: 2018,
		// "script" (默认) 或 "module"（如果你的代码是 ECMAScript 模块)
		// 想使用的额外的语言特性
		ecmaFeatures: {
			// 启用 JSX
			jsx: true,
		},
	},

	rules: {
		'no-unused-vars': 'warn',
		'no-use-before-define': 'off',
		'react/jsx-filename-extension': ['error', { extensions: ['.js', '.jsx', '.ts', '.tsx'] }],
		'simple-import-sort/imports': [
			'error',
			{
				groups: [
					// Packages `react` related packages come first.
					['^react'],
					['^@?\\w'],
					// Internal packages.
					['^(@|components|src)(/.*|$)'],
					// Side effect imports.
					['^\\u0000'],
					// Parent imports. Put `..` last.
					['^\\.\\.(?!/?$)', '^\\.\\./?$'],
					// Other relative imports. Put same-folder imports and `.` last.
					['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
					// Style imports.
					['^.+\\.?(css|less,scss)$'],
				],
			},
		],

		// require
		'@typescript-eslint/no-var-requires': 0,

		'simple-import-sort/exports': 'error', // 导出
		'import/no-duplicates': 'off', // 合并同一个导入。ide自动导入，会导致impoprt {a} from 'A'和impoprt {a1} from 'A'导入2次
		'import/first': 'error', // 确保所有导入位于文件的顶部
		'import/newline-after-import': 'error',

		// resolved
		// 允许导入
		'import/no-unresolved': ['off', { caseSensitive: false }],
		'import/extensions': 'off',
		'import/named': 'off',
		'import/namespace': 'off',
		'import/default': 'off',
		'import/export': 2,
		'react/function-component-definition': 'off',
		'react/react-in-jsx-scope': 'off',
		'react/require-default-props': 'off',
		'import/no-extraneous-dependencies': 'off',
		'@typescript-eslint/ban-ts-comment': 'off',
		'jsx-a11y/click-events-have-key-events': 'off',
		'no-underscore-dangle': 'off',
		'jsx-a11y/no-static-element-interactions': 'off',
		'react/jsx-props-no-spreading': 'off',
		'consistent-return': 'off',
		'@typescript-eslint/no-explicit-any': 'off',
		'react/no-unstable-nested-components': 'off',
	},
	overrides: [],
	settings: {
		/**
		 *
		 * 注意，「import/resolver」并不是eslint规则项，与rules中的「import/extensions」不同。它不是规则项
		 * 这里只是一个参数名，叫「import/resolver」，会传递给每个规则项。
		 * settings并没有具体的书写规则，「import/」只是import模块自己起的名字，原则上，它直接命名为「resolver」也可以，加上「import」只是为了更好地区分。不是强制设置的。
		 * 因为「import」插件很多规则项都用的这个配置项，所以并没有通过rules设置，而是通过settings共享
		 * 具体使用方法可参考https://github.com/benmosher/eslint-plugin-import
		 */

		'import/resolver': {
			/**
			 * 这里传入webpack并不是import插件能识别webpack，而且通过npm安装了「eslint-import-resolver-webpack」，
			 * 「import」插件通过「eslint-import-resolver-」+「webpack」找到该插件并使用，就能解析webpack配置项。使用里面的参数。
			 * 主要是使用以下这些参数，共享给import规则，让其正确识别import路径
			 * extensions: ['.js', '.vue', '.json'],
			 * alias: {
			 *  'vue$': 'vue/dist/vue.esm.js',
			 *  '@': resolve('src'),
			 *  'static': resolve('static')
			 * }
			 */
			webpack: {
				config: 'config/webpack.common.js',
			},
			// alias: {
			// 	'@': resolve('src'),
			// 	src: resolve('src'),
			// },
		},
	},
};
