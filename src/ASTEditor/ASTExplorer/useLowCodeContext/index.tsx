import React, { createContext, useCallback, useRef, useState } from 'react';

import generate from '@babel/generator';
import { useDebounceFn } from 'ahooks';
import { isNumber, isString } from 'lodash';

import {
	addEditMark,
	generateCode,
	prettierFormat,
	removeEditMark,
	removeEditMarkAst,
} from '@/ASTEditor/util';
import { initHoverEvent } from '@/ASTEditor/util/dom';

export const LowCodeContext = createContext<{
	astJson?: any;
	dataMap?: any;
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

const useLowCodeContext = ({
	preElement,
	onCodeChange,
}: {
	onCodeChange: any;

	preElement: HTMLElement | undefined;
}): {
	setAstJson: any;
	reload: any;
	providerValues: any;
	astJson: any;
	setDataMap: any;
	transformCode: string;
} => {
	const [currentItemId, setCurrentItemId] = useState();
	const [currentItemChildId, setCurrentItemChildId] = useState();
	const curAttributeValuesRef = useRef({});
	const [astJson, setAstJson] = useState({});
	const [hoverItemIdMap, setHoverItemMap] = useState({});
	const [dataMap, setDataMap] = useState({});
	const changeAst = e => {
		const out = generateCode(e, transformCode);
		const _code = prettierFormat(out.code);

		const formatCodeOutput = removeEditMark(_code);
		const code = prettierFormat(formatCodeOutput.code);

		setTransformCode(_code);
		onCodeChange?.(code);
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
		const { outputCode, transformDataMap: _transformDataMap, ast } = addEditMark(e);
		setDataMap(_transformDataMap);
		setAstJson(ast);
		setTransformCode(outputCode);
	};
	const { run: debounceReload } = useDebounceFn(() => reloadHover(), { wait: 500, leading: false });
	const [transformCode, setTransformCode] = useState('');
	const providerValues = {
		dataMap,
		currentItemId,
		currentItemChildId,
		reCalculateEditMark: e => {
			setCurrentItemId(undefined);
			setCurrentItemChildId(undefined);
			setDataMap({});
			const _ast = removeEditMarkAst(e);
			const { outputCode, transformDataMap, ast } = addEditMark(_ast);
			setAstJson(ast);
		},
		onComponentDoubleClick: (_props, curData) => {
			const { _low_code_id, _low_code_child_id, children } = _props;
			const hasText = curData?.config?.attribute?.find(it => it?.withTextChildren);
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
		onAstChange: changeAst,
		getAttributeValues: () => {
			return curAttributeValuesRef.current;
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
		setAstJson,
		transformCode,
		transform,
	};
};
export default useLowCodeContext;
