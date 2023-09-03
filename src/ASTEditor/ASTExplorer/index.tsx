import React, { useEffect, useRef, useState } from 'react';
import { JSONTree } from 'react-json-tree';
import MonacoEditor from 'react-monaco-editor/lib/editor';

import { useDebounce, useDebounceFn } from 'ahooks';
import { Button, Input, Tabs } from 'antd';
import classNames from 'classnames';
import {
	cloneDeep,
	get,
	isArray,
	isNumber,
	isObject,
	isString,
	keys,
	pick,
	set,
	take,
} from 'lodash';
import * as monacoEditor from 'monaco-editor';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import CodePreview from '@/ASTEditor/CodePreview';
import { code2 } from '@/ASTEditor/raw-code';
import { toAst, transformCode1 } from '@/ASTEditor/util';

import './index.less';

import {
	findKeyListByLoc,
	getFormatAstJson,
	getLocByKeysList,
	scrollToMarkJsonNode,
	searchNode,
} from './utils/json-node';

const HINT_CLASSNAME = 'monaco-find-ast-remark';
const modalPath = 'ASTExplorer/default';
const initOtherConfig = (m: typeof monacoEditor) => {
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

const theme = {
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
const Index: React.FC = props => {
	const { ...rest } = props;

	const [code, setCode] = useState(code2 || '');
	const [transformCode, setTransformCode] = useState('');
	const [astJson, _setAstJson] = useState({});
	const astJsonRef = useRef({});
	const getAstJson = () => astJsonRef.current;
	const setAstJson = (e: any) => {
		astJsonRef.current = e;
		_setAstJson(e);
	};
	const initCodeRef = useRef(false);
	const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor>();
	const newEditRef = useRef<monacoEditor.editor.IStandaloneCodeEditor>();
	const monacoRef = useRef<typeof monacoEditor>();
	const transform = (e: string) => {
		const ast = toAst(e);
		setAstJson(ast);
	};
	useEffect(() => {
		// try {
		// 	transform(code || '');
		// } catch (e) {
		// 	console.error(e);
		// }
	}, []);
	const lastDecorationsRef = useRef<string[]>();

	const { run: showKeyMark } = useDebounceFn(
		(ketList: string[]) => {
			const loc = getLocByKeysList(ketList, getAstJson());
			if (!loc) {
				return;
			}
			clearMark();
			const r = new monaco.Range(
				loc.start.line,
				loc.start.column + 1,
				loc.end.line,
				loc.end.column + 1
			);
			lastDecorationsRef.current = editorRef.current?.deltaDecorations(
				lastDecorationsRef.current || [],
				[
					{
						range: r,
						options: { inlineClassName: HINT_CLASSNAME },
					},
				]
			);
		},
		{ wait: 30, leading: false }
	);
	const modalRef = useRef<monaco.editor.ITextModel>();

	function extname(pathUrl: string): string {
		const m = /(\.[a-zA-Z0-9]+)$/.exec(pathUrl);
		return m ? m[1] : '';
	}

	const updateCodeToMonaco = (filename: string, content: string, _edit?: any) => {
		const editor = _edit || editorRef.current;
		// 防止noUpdateModel 死循环
		if (editor) {
			const uriVal = monaco.Uri.file(filename);
			let _modal = monaco.editor.getModel(uriVal);
			if (!_modal) {
				const ext = extname(filename);
				const ob: Record<string, string> = {
					'.tsx': 'typescript',
					'.ts': 'typescript',
					'.css': 'css',
					'.json': 'json',
				};

				const language = ob[ext] || '';

				_modal = monaco.editor.createModel(content, language, uriVal);
			} else {
				_modal.setValue(content);
			}

			return _modal;
		}
	};
	const setModelCode = (codeStr?: string) => {
		modalRef.current = updateCodeToMonaco(`${modalPath}/origin.tsx`, codeStr || code || '');
		return modalRef.current;
	};

	const setTransformModelCode = (codeStr: string) =>
		updateCodeToMonaco(`${modalPath}/Transform.tsx`, codeStr || '', newEditRef.current);
	useEffect(() => {
		if (code && modalRef.current && !initCodeRef.current) {
			initCodeRef.current = true;
			setModelCode();
		}
	}, [code]);
	const [searchNodeStr, setSearchNodeStr] = useState('');

	const clearMark = () => {
		if (lastDecorationsRef.current) {
			const r = new monaco.Range(0, 0, 0, 0);

			lastDecorationsRef.current = editorRef.current?.deltaDecorations(
				lastDecorationsRef.current || [],
				[
					{
						range: r,
						options: { inlineClassName: HINT_CLASSNAME },
					},
				]
			);
			editorRef.current?.removeDecorations(lastDecorationsRef.current as any);
			lastDecorationsRef.current = undefined;
		}
	};
	const options: monacoEditor.editor.IStandaloneEditorConstructionOptions = {
		minimap: { enabled: false },
	};

	const searchKeysList = searchNode(astJson, searchNodeStr);

	const checkKeyList = (keyPath: string[] = [], keysList: string[] = []) => {
		const cloneKeys = cloneDeep(keyPath).reverse();
		return (
			keysList?.length &&
			keyPath.length &&
			keysList.some(it => take(it, cloneKeys.length).join('__') === cloneKeys.join('__'))
		);
	};

	const [cursorSelectionRangeKeyList, setCursorSelectionRangeKeyList] = useState([]);
	const { run: onCursorSelection } = useDebounceFn(
		e => {
			const _cursorSelectionLoc = pick(e, [
				'startColumn',
				'endColumn',
				'startLineNumber',
				'endLineNumber',
			]);
			if (
				_cursorSelectionLoc.startLineNumber === _cursorSelectionLoc.endLineNumber &&
				_cursorSelectionLoc.startColumn === _cursorSelectionLoc.endColumn
			) {
				setCursorSelectionRangeKeyList([]);
				return;
			}
			const list = findKeyListByLoc(_cursorSelectionLoc, getAstJson());
			setCursorSelectionRangeKeyList(list);
			setTimeout(() => {
				scrollToMarkJsonNode();
			}, 300);
		},
		{ wait: 300 }
	);
	return (
		<div>
			<div style={{ display: 'grid', gridTemplateColumns: '35% 60px 30% auto' }}>
				<MonacoEditor
					height="100vh"
					width="100%"
					language="typescript"
					options={options}
					editorDidMount={(_edit, m) => {
						editorRef.current = _edit;
						monacoRef.current = m;
						initOtherConfig(m);
						const _modal = setModelCode();
						_edit.setModel(_modal);

						_edit.onDidChangeCursorSelection(e => {
							onCursorSelection(e?.selection);
						});
					}}
					onChange={e => {
						setCode(e);
						transform(e || '');
					}}
				/>
				<div style={{ marginTop: '200px' }}>
					<Button
						type="primary"
						onClick={() => {
							const output = transformCode1(code);
							setTransformCode(output.code);
							const ast = toAst(output.code);

							// setAstJson(ast);
							setTransformModelCode(output.code);
						}}
					>
						转换
					</Button>
				</div>
				<div
					onMouseLeave={() => {
						clearMark();
					}}
				>
					<Tabs
						type="card"
						onChange={e => {
							clearMark();
							if (e !== 'ast') {
								setTimeout(() => {
									setTransformModelCode(code);
								}, 100);
							}
						}}
					>
						<Tabs.TabPane key="ast" tab="ast">
							<div style={{ height: '100vh', overflow: 'scroll' }}>
								<Input
									value={searchNodeStr}
									onChange={e => {
										setSearchNodeStr(e.target.value);
									}}
								/>
								<JSONTree
									data={getFormatAstJson(
										astJson,
										cursorSelectionRangeKeyList?.length
											? cursorSelectionRangeKeyList
											: searchKeysList
									)}
									theme={theme}
									hideRoot
									shouldExpandNodeInitially={(keyPath, data, level) => level <= 5}
									labelRenderer={(keyPath: any) => {
										const label = `"${keyPath[0]}"`;

										const _isSearch = checkKeyList(keyPath, searchKeysList);
										return (
											<div
												onMouseLeave={() => {
													clearMark();
												}}
												className={classNames(
													_isSearch && 'json-tree-find-active',
													!_isSearch &&
														checkKeyList(keyPath, cursorSelectionRangeKeyList) &&
														'json-preview-is-include-selection'
												)}
												onMouseEnter={() => {
													showKeyMark(cloneDeep(keyPath) as any);
												}}
											>
												{label}
											</div>
										);
									}}
								/>
							</div>
						</Tabs.TabPane>
						<Tabs.TabPane key="code" tab="code">
							<div style={{ height: '100vh', overflow: 'scroll' }}>
								<MonacoEditor
									height="100vh"
									width="100%"
									language="typescript"
									options={options}
									editorDidMount={(_edit, m) => {
										initOtherConfig(m);
										newEditRef.current = _edit;
										const _modal = setTransformModelCode(transformCode);
										_edit.setModel(_modal);
									}}
								/>
							</div>
						</Tabs.TabPane>
					</Tabs>
				</div>

				<div className="right-panel">
					<CodePreview
						files={[{ filename: 'index.tsx', code: transformCode || code }]}
						demoId="modalPath"
					/>
					<div />
				</div>
			</div>
		</div>
	);
};
export default Index;
