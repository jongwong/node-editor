import React, { createContext, useContext, useEffect, useRef } from 'react';

import { NodePath } from '@babel/traverse';
import { useDebounceFn } from 'ahooks';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { cloneDeep, get, omit } from 'lodash';
import uuid from 'uuid';

import useParentIframeMessage from '@/iframe-component/useParentIframeMessage';
import materialStore from '@/LowCode/ASTEditor/ASTExplorer/material-store';
import {
	addEditMark,
	generateCode,
	getNodeUIDPathMap,
	prettierFormat,
} from '@/LowCode/ASTEditor/utils';
import { findNodeByUid, getJSXElementName } from '@/LowCode/ASTEditor/utils/ast-node';
import { initHoverEvent } from '@/LowCode/ASTEditor/utils/dom';

// 创建 Jotai 原子状态
const astJsonAtom = atom({});
const currentItemIdAtom = atom<string | undefined>(undefined);
const currentItemChildIdAtom = atom<string | undefined>(undefined);
const hoverItemIdMapAtom = atom({});
const transformCodeAtom = atom('');
const dataRefTimeAtom = atom('');

// Create a context for the data instance
const DataContext = createContext<{
	ready: boolean;
	getDataInstance: () => Partial<InstanceReturnType>;
}>({
	ready: false,
	getDataInstance: () => ({}),
});
// 实例返回类型定义
type InstanceReturnType = {
	currentItemId: string | undefined;
	getAttributeValues: () => Record<string, any>;
	getNodeById: (id: string) => any | undefined;
	onComponentDoubleClick: () => void;
	getPathKeyById: (id: string) => string | undefined;
	getNonePathIdMap: () => any;
	getPathById: (id: string) => NodePath | undefined;
	/** @deprecated */
	ast: any;
	AstJson: any;
	getASTJson: () => any;
	transform: () => string;
	transformCode?: string;
	currentItemChildId?: string;
};

// 低代码上下文组件，包含 AST 状态和转换方法
const LowCodeContextDataProvider = ({
	preElement,
	onCodeChange,
	children,
}: {
	onCodeChange: any;
	preElement: any;
	children?: React.ReactNode;
}): JSX.Element => {
	// 使用 Jotai 状态
	const setCurrentItemId = useSetAtom(currentItemIdAtom);
	const setCurrentItemChildId = useSetAtom(currentItemChildIdAtom);
	const _setAstJson = useSetAtom(astJsonAtom);
	const astJson = useAtomValue(astJsonAtom);
	const setHoverItemMap = useSetAtom(hoverItemIdMapAtom);
	const astJsonRef = useRef<any>();
	const [dataRefTime, setDataRefTime] = useAtom(dataRefTimeAtom);
	const setAstJson = (e: any) => {
		astJsonRef.current = e;
		updateNonePathIdMap(e);
		_setAstJson(e);
	};
	// 使用引用保存属性值和节点路径映射
	const curAttributeValuesRef = useRef({});
	const nonePathIdMap = useRef({});
	const { run: debounceReload } = useDebounceFn(() => reloadHover(), { wait: 500, leading: false });
	const [transformCode, setTransformCode] = useAtom(transformCodeAtom);

	const updateNonePathIdMap = (e: any) => {
		nonePathIdMap.current = getNodeUIDPathMap(e);
		setDataRefTime(uuid());
	};
	useEffect(() => {
		if (!Object.keys(astJsonRef.current || {}).length) {
			astJsonRef.current = astJson;
		}
		if (!Object.keys(nonePathIdMap.current || {}).length) {
			updateNonePathIdMap(astJson);
		}
	}, [astJson]);

	// 更新 AST 状态并格式化代码
	const changeAst = newAst => {
		const formattedCode = generateCode(cloneDeep(newAst), transformCode);
		const prettifiedCode = prettierFormat(formattedCode.code);

		setAstJson(newAst);
		setTransformCode(prettifiedCode);
		onCodeChange?.(prettifiedCode);
	};
	const getDataInstance = () => ({
		getASTJson: () => astJsonRef.current,
		getAttributeValues: () => curAttributeValuesRef.current,
		getNonePathIdMap: () => nonePathIdMap?.current,
		updateAst: changeAst,
		onComponentDoubleClick: (_props, curData) => {
			const { _low_code_id, _low_code_child_id, children } = _props;
			const name = getJSXElementName(curData);
			const _config = materialStore.data?.find(it => it.name === name);
			const _attributeValue = omit({ ...children.props }, ['children']);

			curAttributeValuesRef.current = _attributeValue;
			setCurrentItemId(_low_code_id);
			setCurrentItemChildId(_low_code_child_id);
		},
	});

	// 重新加载 hover 事件
	const reloadHover = () => {
		if (!preElement) return;

		const el = preElement.querySelector(`[low-code-uuid]`);
		if (!el) return;

		initHoverEvent(preElement);
	};
	useParentIframeMessage(getDataInstance);
	return (
		<DataContext.Provider value={{ ready: true, getDataInstance: getDataInstance as any }}>
			{children}
		</DataContext.Provider>
	);
};

// 自定义钩子，从 useLowCodeContext 获取实例
export const useLowCodeInstance: () => InstanceReturnType = () => {
	const astJson = useAtomValue(astJsonAtom);
	const currentItemId = useAtomValue(currentItemIdAtom);
	const currentItemChildId = useAtomValue(currentItemChildIdAtom);
	const transformCode = useAtomValue(transformCodeAtom);
	// 从 useLowCodeContext 获取实例
	const { getDataInstance } = useContext(DataContext);
	// 根据 ID 获取路径键
	const getPathKeyById = (id: string) => {
		const instance = getDataInstance();
		const ob = instance?.getNonePathIdMap?.() || {};
		const find = ob[id]?.pathKey;

		if (find) {
			return find;
		}
		return findNodeByUid(instance?.getASTJson?.(), id);
	};

	const setAstJson = useSetAtom(astJsonAtom);
	const setCurrentItemId = useSetAtom(currentItemIdAtom);
	const setCurrentItemChildId = useSetAtom(currentItemChildIdAtom);
	const setTransformCode = useSetAtom(transformCodeAtom);
	// 转换并格式化代码
	const transform = (code: string) => {
		const { outputCode, ast } = addEditMark(code);
		setAstJson(ast);
		setCurrentItemId(undefined);
		setCurrentItemChildId(undefined);
		// curAttributeValuesRef.current = {};
		setTransformCode(outputCode);
		return outputCode;
	};

	return {
		currentItemId,
		transform: transform,
		getAttributeValues: () => {
			const instance = getDataInstance();
			return instance?.getAttributeValues?.();
		},
		currentItemChildId,
		ast: astJson,
		AstJson: astJson,
		getMaterialStore: () => materialStore,
		getAst: () => {
			const instance = getDataInstance();
			return instance?.getASTJson?.();
		},
		getASTJson: () => {
			const instance = getDataInstance();
			return instance?.getASTJson?.();
		},
		getNodeById: id => {
			const instance = getDataInstance();
			const _path = getPathKeyById(id);
			const ast = instance?.getASTJson?.();
			return get(ast, _path);
		},
		getNonePathIdMap: () => {
			const instance = getDataInstance();
			return instance?.getNonePathIdMap?.();
		},
		getPathKeyById,
		onComponentDoubleClick: () => {
			const instance = getDataInstance();
			return instance?.onComponentDoubleClick;
		},
		// updateAst: instance?.updateAst,
		transformCode,
	};
};

export default LowCodeContextDataProvider;
export const useTransformCode = () => {
	return useAtom(transformCodeAtom);
};

export const useASTJson = () => {
	return useAtom(astJsonAtom);
};

export const useDataRefTimeAtom = () => {
	return useAtom(dataRefTimeAtom);
};
