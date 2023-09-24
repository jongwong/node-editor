import * as monacoEditor from 'monaco-editor';
import * as monaco from 'monaco-editor';

export const initOtherConfig = (m: typeof monacoEditor) => {
	m.languages.typescript.typescriptDefaults.setEagerModelSync(true);
	m.languages.typescript.javascriptDefaults.setEagerModelSync(true);
	// 打开语法检查功能
	m.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
		noSemanticValidation: true,
		noSyntaxValidation: true,
	});
	m.languages.typescript.javascriptDefaults.setCompilerOptions({
		allowJs: true,
		jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
		// module: monaco.languages.typescript.ModuleKind.CommonJS,
		typeRoots: ['node_modules/@types'],
	});
	m.languages.typescript.typescriptDefaults.setCompilerOptions({
		jsx: monaco.languages.typescript.JsxEmit.ReactJSX,
		// module: monaco.languages.typescript.ModuleKind.CommonJS,
		noEmit: true,
		typeRoots: ['node_modules/@types'],
	});
};

export const astViewTheme = {
	scheme: 'monokai',
	author: 'wimer hazenberg (http://www.monokai.nl)',
	base00: '#ffffff',
	base01: '#ffffff',
	base02: '#49483e',
	base03: '#75715e',
	base04: '#a59f85',
	base05: '#f8f8f2',
	base06: '#f5f4f1',
	base07: '#f9f8f5',
	base08: '#f92672',
	base09: '#fd971f',
	base0A: '#f4bf75',
	base0B: '#a4bb74',
	base0C: '#a1efe4',
	base0D: '#78a8a8',
	base0E: '#ae81ff',
	base0F: '#cc6633',
};
