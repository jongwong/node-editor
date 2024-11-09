import React, { createContext, useContext, useEffect, useRef } from 'react';

import { NodePath } from '@babel/traverse';
import { useDebounceFn } from 'ahooks';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { cloneDeep, get, omit } from 'lodash';
import uuid from 'uuid';

import useParentIframeMessage, {
	postInstanceData,
} from '@/iframe-component/useParentIframeMessage';
import materialStore from '@/LowCode/ASTEditor/ASTExplorer/material-store';
import {
	addEditMark,
	generateCode,
	getNodeUIDPathMap,
	prettierFormat,
} from '@/LowCode/ASTEditor/utils';
import {
	findNodeByUid,
	findNodePathLocationByUid,
	getJSXElementName,
} from '@/LowCode/ASTEditor/utils/ast-node';
import { initHoverEvent } from '@/LowCode/ASTEditor/utils/dom';

// 创建 Jotai 原子状态
const astJsonAtom = atom({});
const currentItemIdAtom = atom<string | undefined>(undefined);
const currentItemChildIdAtom = atom<string | undefined>(undefined);
const hoverItemIdMapAtom = atom({});
const transformCodeAtom = atom('');
const dataRefTimeAtom = atom('');

const globalInstance: { getDataInstance: () => Partial<InstanceReturnType> } = {
	getDataInstance: () => ({}),
};

// 实例返回类型定义
type InstanceReturnType = {
	currentItemId: string | undefined;
	getNodeById: (id: string) => any | undefined;
	getPathKeyById: (id: string) => string | undefined;
	getNonePathIdMap: () => any;
	getPathById: (id: string) => NodePath | undefined;
	/** @deprecated */
	ast: any;
	AstJson: any;
	getASTJson: () => any;
	updateASTJson: (e: any) => void;
	getMaterialStore: () => any;
	transformCode?: string;
	currentItemChildId?: string;
};

// 低代码上下文组件，包含 AST 状态和转换方法
const LowCodeContextDataProvider = ({
	preElement,
	onCodeChange,
	children,
	actionRef,
}: {
	onCodeChange: any;
	preElement: any;
	children?: React.ReactNode;
	actionRef?: (e: any) => void;
}): JSX.Element => {
	// 使用 Jotai 状态
	const setCurrentItemId = useSetAtom(currentItemIdAtom);
	const setCurrentItemChildId = useSetAtom(currentItemChildIdAtom);
	const _setAstJson = useSetAtom(astJsonAtom);
	const astJson = useAtomValue(astJsonAtom);
	const setHoverItemMap = useSetAtom(hoverItemIdMapAtom);
	const astJsonRef = useRef<any>();
	const setAstJson = (e: any) => {
		astJsonRef.current = e;

		updateNonePathIdMap(e);
		_setAstJson(e);
	};
	const initedRef = useRef(false);

	const nonePathIdMap = useRef({});
	const { run: debounceReload } = useDebounceFn(() => reloadHover(), { wait: 500, leading: false });
	const [transformCode, setTransformCode] = useAtom(transformCodeAtom);

	const updateNonePathIdMap = (e: any) => {
		nonePathIdMap.current = getNodeUIDPathMap(e);
		postInstanceData(e, nonePathIdMap.current);
	};

	// 更新 AST 状态并格式化代码
	const changeAst = (newAst: any) => {
		const formattedCode = generateCode(cloneDeep(newAst), transformCode);
		const prettifiedCode = prettierFormat(formattedCode.code);
		setAstJson(newAst);
		setTransformCode(prettifiedCode);
		onCodeChange?.(prettifiedCode);
	};
	const getDataInstance = () => ({
		getASTJson: () => {
			return astJsonRef.current;
		},
		getNonePathIdMap: () => {
			return nonePathIdMap?.current;
		},
		updateASTJson: changeAst,
	});
	// @ts-ignore
	globalInstance.getDataInstance = getDataInstance;

	actionRef?.({
		initCode: (code: string) => {
			initedRef.current = true;
			const { outputCode, ast } = addEditMark(code);
			setTimeout(() => {
				setAstJson(ast);
				setTransformCode(outputCode);
				setCurrentItemId(undefined);
				setCurrentItemChildId(undefined);
			}, 300);
		},
		hasInit: () => initedRef.current,
	});
	// 重新加载 hover 事件
	const reloadHover = () => {
		if (!preElement) return;

		const el = preElement.querySelector(`[low-code-uuid]`);
		if (!el) return;

		initHoverEvent(preElement);
	};
	useParentIframeMessage(getDataInstance);
	return <>{children}</>;
};

// 自定义钩子，从 useLowCodeContext 获取实例
export const useLowCodeInstance: () => InstanceReturnType = () => {
	const astJson = useAtomValue(astJsonAtom);
	const currentItemId = useAtomValue(currentItemIdAtom);
	const currentItemChildId = useAtomValue(currentItemChildIdAtom);
	const transformCode = useAtomValue(transformCodeAtom);
	// 从 useLowCodeContext 获取实例
	const getDataInstance = globalInstance.getDataInstance;
	// 根据 ID 获取路径键
	const getPathKeyById = (id: string) => {
		const instance = getDataInstance();
		const ob = instance?.getNonePathIdMap?.() || {};
		const find = ob[id]?.pathKey;

		if (find) {
			return find;
		}
		return findNodePathLocationByUid(instance?.getASTJson?.(), id);
	};

	return {
		currentItemId,
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
		updateASTJson: (ast: any) => {
			const instance = getDataInstance();
			return instance?.updateASTJson?.(ast);
		},
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
