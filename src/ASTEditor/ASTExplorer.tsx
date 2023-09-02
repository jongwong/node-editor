import React, { useEffect, useRef, useState } from 'react';
import { JSONTree } from 'react-json-tree';
import MonacoEditor from 'react-monaco-editor/lib/editor';

import { Button } from 'antd';
import { cloneDeep, forEach, get, take } from 'lodash';
import * as monacoEditor from 'monaco-editor';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';

import { code1, code2 } from '@/ASTEditor/code';
import { toAst } from '@/ASTEditor/util';

import './index.less';

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
const ASTExplorer: React.FC = props => {
	const { ...rest } = props;
	const options = {
		minimap: { enabled: false },
	};
	const [code, setCode] = useState(code2);
	const [astJson, _setAstJson] = useState({});
	const astJsonRef = useRef({});
	const getAstJson = () => astJsonRef.current;
	const setAstJson = (e: any) => {
		astJsonRef.current = e;
		_setAstJson(e);
	};
	const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor>();
	const monacoRef = useRef<typeof monacoEditor>();
	const transform = (e: string) => {
		const json = toAst(e);
		setAstJson(json);
	};
	useEffect(() => {
		transform(code || '');
	}, []);
	const lastDecorationsRef = useRef<string[]>();
	const showKeyMark = (keys: string[]) => {
		const _astJson = getAstJson();
		const oldKeys = keys.reverse();
		let _keys = oldKeys;
		_keys = take(keys, keys.length - 1);
		let find = _keys.length ? get(_astJson, _keys) : _astJson;

		if (!find?.loc) {
			find = get(_astJson, oldKeys);
		}
		const loc = find?.loc;

		if (!loc) {
			return;
		}
		setTimeout(() => {
			if (lastDecorationsRef.current) {
				editorRef.current?.removeDecorations(lastDecorationsRef.current);
			}
			lastDecorationsRef.current = editorRef.current?.deltaDecorations(
				[],
				[
					{
						range: new monaco.Range(loc.start.line, find.start + 1, loc.end.line, find.end + 1),
						options: { inlineClassName: 'monaco-find-ast-remark' },
					},
				]
			);
		}, 100);
	};
	const clearMark = () => {
		if (lastDecorationsRef.current) {
			editorRef.current?.removeDecorations(lastDecorationsRef.current);
			lastDecorationsRef.current = undefined;
		}
		// setTimeout(() => {
		// 	const els = document.querySelectorAll('.monaco-find-ast-remark') || [];
		// 	const len = els?.length;
		// 	for (let i = 0; i < len; i++) {
		// 		const it = els[i];
		// 		console.log('======it====>', it);
		// 		if (it.classList.contains('monaco-find-ast-remark')) {
		// 			it.classList.remove('monaco-find-ast-remark');
		// 		}
		// 	}
		// }, 50);
	};

	return (
		<div>
			<div style={{ display: 'grid', gridTemplateColumns: '50% 100px auto' }}>
				<MonacoEditor
					height="100vh"
					width="100%"
					language="javascript"
					value={code}
					options={options}
					editorDidMount={(_edit, m) => {
						editorRef.current = _edit;
						monacoRef.current = m;
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
							transform(code);
						}}
					>
						转换
					</Button>
				</div>
				<div style={{ height: '100vh', overflow: 'scroll' }}>
					<JSONTree
						data={astJson}
						theme={theme}
						hideRoot
						labelRenderer={(keys: any) => {
							const label = `"${keys[0]}"`;
							return (
								<div
									onMouseLeave={() => {
										clearMark();
									}}
									onMouseEnter={() => {
										showKeyMark(cloneDeep(keys) as any);
									}}
								>
									{label}
								</div>
							);
						}}
					/>
				</div>
			</div>
		</div>
	);
};
export default ASTExplorer;
