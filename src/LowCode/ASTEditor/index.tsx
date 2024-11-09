import React, { useEffect, useRef, useState } from 'react';
import { DndProvider, useDragLayer } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { JSONTree } from 'react-json-tree';
import SplitPane from 'react-split-pane';

import { MinusOutlined } from '@ant-design/icons';
import Editor from '@monaco-editor/react';
import { useDebounce, useDebounceFn } from 'ahooks';
import { Button, FloatButton, Input } from 'antd';
import classNames from 'classnames';
import {
	cloneDeep,
	get,
	has,
	isArray,
	isNumber,
	isObject,
	isString,
	keys,
	pick,
	set,
	take,
} from 'lodash';
import * as monaco from 'monaco-editor';

import Tabs from '@/components/Tabs';
import LowCodeDragItem from '@/iframe-component/LowCodeDragItem';
import LowCodeItemContainer from '@/iframe-component/LowCodeItemContainer';
import useParentIframeMessage from '@/iframe-component/useParentIframeMessage';
import AttributePanel from '@/LowCode/ASTEditor/ASTExplorer/AttributePanel';
import { astViewTheme, initOtherConfig } from '@/LowCode/ASTEditor/ASTExplorer/init';
import MaterialPanel from '@/LowCode/ASTEditor/ASTExplorer/MaterialPanel';
import TreePanel from '@/LowCode/ASTEditor/ASTExplorer/TreePanel';
import useLowCodeContext, {
	useASTJson,
	useLowCodeInstance,
	useTransformCode,
} from '@/LowCode/ASTEditor/ASTExplorer/useLowCodeContext';
import LowCodeContextDataProvider from '@/LowCode/ASTEditor/ASTExplorer/useLowCodeContext';
import rawCode from '@/LowCode/ASTEditor/raw-code';
import SplitLayout from '@/LowCode/ASTEditor/SplitLayout';
import {
	addEditMark,
	formattedJson,
	generateCode,
	prettierFormat,
	removeEditMark,
	removeEditMarkAst,
} from '@/LowCode/ASTEditor/utils';
import { bundleFiles, ServerUrl } from '@/LowCode/ASTEditor/utils/bundle-service';
import { getQueryParams } from '@/LowCode/ASTEditor/utils/dom';

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

window.LowCodeItemContainer = LowCodeItemContainer;

window.LowCodeDragItem = LowCodeDragItem;

const Index: React.FC<{ children?: React.ReactNode }> = props => {
	const [code, setCode] = useState(prettierFormat(rawCode || ''));

	const previewElRef = useRef<HTMLDivElement>();
	const astJsonRef = useRef({});
	const getASTJson = () => astJsonRef.current;
	const [showDebugPanel, setShowDebugPanel] = useState(false);

	const initCodeRef = useRef(false);
	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor>();
	const newEditRef = useRef<monaco.editor.IStandaloneCodeEditor>();
	const monacoRef = useRef<typeof monaco>();
	const [transformCode] = useTransformCode();
	const [astJson] = useASTJson();

	const lowcodeDataActionRef = useRef();
	const lastDecorationsRef = useRef<string[]>();

	const { run: showKeyMark } = useDebounceFn(
		(ketList: string[]) => {
			const loc = getLocByKeysList(ketList, getASTJson());
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
		if (lowcodeDataActionRef.current?.hasInit && !lowcodeDataActionRef.current?.hasInit()) {
			lowcodeDataActionRef.current?.initCode?.(code);
		}
	}, [lowcodeDataActionRef.current]);
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
	const options: monaco.editor.IStandaloneEditorConstructionOptions = {
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

	const renderVerticalText = (text: string) => {
		return (
			<span
				style={{
					writingMode: 'vertical-rl', // 使文字垂直排列
					transform: 'rotate(180deg)', // 修正文字垂直排列的方向
					whiteSpace: 'nowrap', // 防止文字换行
				}}
			>
				{text}
			</span>
		);
	};

	useEffect(() => {
		if (transformCode) {
			bundleFiles([
				{
					filename: 'index.tsx',
					code: transformCode,
				},
			]);
		}
	}, [transformCode]);
	const renderDebugCode = () => {
		return (
			<>
				{showDebugPanel ? (
					<div
						style={{
							position: 'absolute',
							left: 0,
							right: 0,
							top: 0,
							bottom: 0,
							zIndex: 10,
							background: 'white',
						}}
					>
						<Tabs
							destroyInactiveTabPane
							items={[
								{
									key: 'ast-json',
									label: 'ast-json',
									children: (
										<Editor
											language={'json'}
											options={options}
											value={formattedJson(JSON.stringify(astJson) || '{}')}
										/>
									),
								},
								{
									key: 'ast',
									label: 'ast',
									children: (
										<div style={{ height: '95vh', overflow: 'auto' }}>
											<Input
												value={searchNodeStr}
												onChange={e => {
													setSearchNodeStr(e.target.value);
												}}
											/>
											<JSONTree
												data={getFormatAstJson(astJson, searchKeysList)}
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
																!_isSearch && 'json-preview-is-include-selection'
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
									),
								},
								{
									key: 'code',
									label: 'code',
									children: (
										<div style={{ overflow: 'scroll' }}>
											<Input.TextArea value={transformCode} autoSize />
										</div>
									),
								},
								{
									key: 'rawCode',
									label: 'rawCode',
									children: (
										<div style={{ overflow: 'scroll' }}>
											<Input.TextArea
												value={generateCode(removeEditMarkAst(astJson)).code}
												autoSize
											/>
										</div>
									),
								},
							]}
							onChange={e => {
								clearMark();
								if (e !== 'ast') {
									setTimeout(() => {
										setTransformModelCode(code);
									}, 100);
								}
							}}
						/>
					</div>
				) : null}
				<FloatButton
					icon={<span>B</span>}
					onClick={() => setShowDebugPanel(!showDebugPanel)}
				></FloatButton>
			</>
		);
	};
	return (
		<div>
			<LowCodeContextDataProvider
				onCodeChange={e => {
					setCode(e);
				}}
				actionRef={e => (lowcodeDataActionRef.current = e)}
				preElement={previewElRef.current}
			>
				<DndProvider backend={HTML5Backend} context={window}>
					<SplitLayout
						bottomTabsItems={[
							{
								key: 'material',
								label: '组件',
								children: <MaterialPanel />,
							},
							{
								key: 'code',
								label: '代码',
								children: (
									<div className={'h-1-1'} style={{ overflow: 'hidden' }}>
										<Editor
											width="100%"
											language="typescript"
											options={options}
											path={`${modalPath}/origin.tsx`}
											defaultLanguage={'typescript'}
											value={code}
											onMount={(_edit, m) => {
												editorRef.current = _edit;
												monacoRef.current = m;
												initOtherConfig(m);
											}}
											onChange={e => {
												transform(e || '');
											}}
										/>
									</div>
								),
							},
						]}
						leftTabsItems={[
							{
								key: 'Project',
								label: renderVerticalText('Project'),
								children: <TreePanel />,
							},
						]}
						rightTabsItems={[
							{
								key: 'attribute',
								label: '属性',
								children: <AttributePanel code={transformCode} />,
							},
						]}
					>
						<div className={'main-panel transparent-bg-panel'} ref={previewElRef as any}>
							<iframe src={ServerUrl + '/preview'} id={'lowcode-preview'} />
						</div>
					</SplitLayout>
				</DndProvider>
				{renderDebugCode()}
			</LowCodeContextDataProvider>
		</div>
	);
};
export default Index;
