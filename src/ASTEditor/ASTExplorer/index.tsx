import React, { useEffect, useRef, useState } from 'react';
import { DndProvider, useDragLayer } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { JSONTree } from 'react-json-tree';
import MonacoEditor from 'react-monaco-editor';

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

import AttributePanel from '@/ASTEditor/ASTExplorer/AttributePanel';
import { astViewTheme, initOtherConfig } from '@/ASTEditor/ASTExplorer/init';
import MaterialPanel from '@/ASTEditor/ASTExplorer/MaterialPanel';
import useLowCodeContext, {
	LowCodeContextProvider,
} from '@/ASTEditor/ASTExplorer/useLowCodeContext';
import CodePreview from '@/ASTEditor/CodePreview';
import rawCode from '@/ASTEditor/raw-code';
import { addEditMark, generateCode, prettierFormat, removeEditMark } from '@/ASTEditor/util';

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

const Index: React.FC = props => {
	const { ...rest } = props;

	const [code, setCode] = useState(prettierFormat(rawCode || ''));

	const previewElRef = useRef<HTMLDivElement>();
	const astJsonRef = useRef({});
	const getAstJson = () => astJsonRef.current;

	const initCodeRef = useRef(false);
	const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor>();
	const newEditRef = useRef<monacoEditor.editor.IStandaloneCodeEditor>();
	const monacoRef = useRef<typeof monacoEditor>();

	const { astJson, providerValues, reload, transformCode, transform } = useLowCodeContext({
		onCodeChange: e => {
			setModelCode(e);
		},
		preElement: previewElRef.current,
	});

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
			const m = modalRef.current;
			if (!m || code !== m?.getValue()) {
				setModelCode(code);
			}
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

	useEffect(() => {
		transform(code);
	}, []);
	const isFocusedRef = useRef(false);
	return (
		<div>
			<LowCodeContextProvider value={providerValues}>
				<DndProvider backend={HTML5Backend} context={window}>
					<div style={{ display: 'grid', gridTemplateColumns: '0%  30% auto' }}>
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
								_edit.onDidFocusEditorText(e => {
									isFocusedRef.current = true;
								});
								_edit.onDidBlurEditorText(e => {
									isFocusedRef.current = false;
								});
							}}
							onChange={e => {
								if (!isFocusedRef.current) {
									return;
								}
								setCode(e);

								transform(e || '');
							}}
						/>

						<div
							className="right-panel"
							onMouseLeave={() => {
								clearMark();
							}}
						>
							<Tabs
								type="card"
								destroyInactiveTabPane
								onChange={e => {
									clearMark();
									if (e !== 'ast') {
										setTimeout(() => {
											setTransformModelCode(code);
										}, 100);
									}
								}}
							>
								<Tabs.TabPane key="attribute" tab="属性">
									<div style={{ height: '100vh', overflow: 'scroll' }}>
										<AttributePanel code={transformCode} />
									</div>
								</Tabs.TabPane>
								<Tabs.TabPane key="ast" tab="ast">
									<div style={{ height: '95vh', overflow: 'auto' }}>
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
											theme={astViewTheme}
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
														onDoubleClick={() => {
															const val = get(astJson, cloneDeep(keyPath).reverse());
														}}
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

								<Tabs.TabPane key="code" tab="代码">
									<div style={{ height: '100vh', overflow: 'scroll' }}>
										<Input.TextArea value={transformCode} autoSize />
									</div>
								</Tabs.TabPane>

								<Tabs.TabPane key="material" tab="物料库">
									<MaterialPanel />
								</Tabs.TabPane>
							</Tabs>
						</div>

						<div ref={previewElRef as any} style={{ marginTop: '50px' }}>
							<CodePreview
								onPreviewReRender={() => {
									reload();
								}}
								files={[{ filename: 'index.tsx', code: transformCode }]}
								demoId="modalPath"
							/>
						</div>
					</div>
				</DndProvider>
			</LowCodeContextProvider>
		</div>
	);
};
export default Index;
