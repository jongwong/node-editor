import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

import generate from '@babel/generator';
import { NodePath } from '@babel/traverse';
import { useDebounceFn } from 'ahooks';
import { get, isNumber, isString } from 'lodash';

import materialStore from '@/ASTEditor/ASTExplorer/material-store';
import useProState from '@/ASTEditor/hooks/useProState';
import {
	addAttrMarkByAst,
	addEditMark,
	generateCode,
	getNodeUIDPathMap,
	prettierFormat,
	removeEditMark,
	removeEditMarkAst,
} from '@/ASTEditor/util';
import { findNodeByUid, getJSXElementName } from '@/ASTEditor/util/ast-node';
import { initHoverEvent } from '@/ASTEditor/util/dom';

const LowCodeContext = createContext<{
	astJson?: any;
	currentItemId?: string;
	currentItemChildId?: string;
	onComponentDoubleClick?: (
		_low_code_id: string,
		e: {
			data: any;
			_low_code_child_id: string;
			attributeValue: any;
		}
	) => void;
}>({});
export const LowCodeContextProvider = LowCodeContext.Provider;

type InstanceReturnType = {
	currentItemId: string | undefined;
	getAttributeValues: () => Record<string, any>;
	getNodeById: (id: string) => any | undefined;
	onComponentDoubleClick: () => void;
	getPathKeyById: (id: string) => string | undefined;
	getPathById: (id: string) => NodePath | undefined;
};
export const useLowCodeInstance: () => InstanceReturnType = () => {
	const { astJson, currentItemId, updateAst, transformCode, currentItemChildId, getDataInstance } =
		useContext(LowCodeContext);
	const instance = getDataInstance();
	const getPathKeyById = (id: string) => {
		const ob = instance.getNonePathMap();
		const find = ob[id]?.pathKey;

		if (find) {
			return find;
		}
		return findNodeByUid(instance.getAstJson(), id);
	};
	return {
		currentItemId,
		getAttributeValues: () => instance.getAttributeValues(),
		currentItemChildId,
		transformCode,
		ast: astJson,
		getMaterialStore: () => materialStore,
		getAst: () => instance.getAstJson(),
		getNodeById: (id, test) => {
			const _path = getPathKeyById(id);
			const ast = instance.getAstJson();
			return get(ast, _path);
		},
		getTestNonePathMap: () => instance.getNonePathMap(),
		getPathKeyById,
		getPathById: (id: string) => {
			const ob = instance.getNonePathMap();
			const find = ob[id]?.path;
			return find;
		},
		onComponentDoubleClick: instance.onComponentDoubleClick,
		updateAst: instance.updateAst,
	};
};
export default ({
	preElement,
	onCodeChange,
}: {
	onCodeChange: any;

	preElement: HTMLElement | undefined;
}): {
	reload: any;
	providerValues: any;
	astJson: any;
	transformCode: string;
	transform: (code: string) => string;
} => {
	const [currentItemId, setCurrentItemId] = useState();
	const [currentItemChildId, setCurrentItemChildId] = useState();
	const curAttributeValuesRef = useRef({});
	const idNonePathMap = useRef({});
	const [astJson, _setAstJson, getAstJson] = useProState({});
	const { run: debounceReload } = useDebounceFn(() => reloadHover(), { wait: 500, leading: false });
	const [transformCode, setTransformCode] = useState('');
	const setAstJson = e => {
		idNonePathMap.current = getNodeUIDPathMap(e);
		_setAstJson(e);
	};

	const [hoverItemIdMap, setHoverItemMap] = useState({});
	const changeAst = e => {
		const formatCodeOutput1 = generateCode(e, transformCode);
		const newAst = addAttrMarkByAst(e);
		const formatCodeOutput = generateCode(newAst, transformCode);
		const _code = prettierFormat(formatCodeOutput.code);

		const noReMarkAst = removeEditMarkAst(e);
		const noReMarkOutput = generateCode(noReMarkAst, _code);
		const noReMarkCode = prettierFormat(noReMarkOutput.code);

		onCodeChange?.(noReMarkCode);
		setAstJson(newAst);
		setTransformCode(_code);
	};
	const reloadHover = () => {
		if (!preElement) {
			return;
		}

		const el = preElement.querySelector(`[low-code-uuid]`);
		if (!el) {
			return;
		}

		initHoverEvent(preElement);
	};

	const transform = (e: string) => {
		const { outputCode, ast } = addEditMark(e);
		setAstJson(ast);
		setCurrentItemId(undefined);
		setCurrentItemChildId(undefined);
		curAttributeValuesRef.current = {};
		setTransformCode(outputCode);
		return outputCode;
	};

	const providerValues = {
		currentItemId,
		currentItemChildId,
		transformCode,
		getDataInstance: () => {
			return {
				getAstJson: () => getAstJson(),
				getAttributeValues: () => {
					return curAttributeValuesRef.current;
				},
				getNonePathMap: () => {
					return idNonePathMap.current;
				},
				updateAst: changeAst,
				onComponentDoubleClick: (_props, curData) => {
					const { _low_code_id, _low_code_child_id, children } = _props;

					const name = getJSXElementName(curData);
					const _config = materialStore.data?.find(it => it.name === name);

					const hasText = _config?.attribute?.find(it => it?.withTextChildren);

					const _children = children?.props?.children;
					const findIndex = hasText ? _children?.findIndex(it => isString(it) || isNumber(it)) : -1;
					const _attributeValue = {
						...children.props,
						children: findIndex >= 0 ? _children[findIndex] : undefined,
					};

					curAttributeValuesRef.current = _attributeValue;

					setCurrentItemId(_low_code_id);
					setCurrentItemChildId(_low_code_child_id);
				},
			};
		},
		astJson: astJson,
		hoverItemIdMap,
		onItemHover: (uuid, e) => {
			setHoverItemMap(old => ({ ...old, uuid: e }));
		},
	};
	return {
		providerValues,
		astJson,
		reload: debounceReload,
		transformCode,
		transform,
	};
};
