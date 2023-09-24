import React, { createContext, useCallback, useRef, useState } from 'react';

import { useDebounceFn } from 'ahooks';
import { isNumber, isString } from 'lodash';

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
	changeAst,
	preElement,
}: {
	changeAst: any;
	preElement: HTMLElement | undefined;
}): {
	setAstJson: any;
	reload: any;
	providerValues: any;
	astJson: any;
	setDataMap: any;
} => {
	const [currentItemId, setCurrentItemId] = useState();
	const [currentItemChildId, setCurrentItemChildId] = useState();
	const curAttributeValuesRef = useRef({});
	const [astJson, setAstJson] = useState({});
	const [hoverItemIdMap, setHoverItemMap] = useState({});
	const [dataMap, setDataMap] = useState({});

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
	const { run: debounceReload } = useDebounceFn(() => reloadHover(), { wait: 500, leading: false });

	const providerValues = {
		dataMap,
		currentItemId,
		currentItemChildId,
		onComponentDoubleClick: (_props, curData) => {
			const { _low_code_id, _low_code_child_id, children } = _props;
			const hasText = curData?.config?.attribute?.find(it => it?.withTextChildren);
			const _children = children?.props?.children;
			const findIndex = hasText ? _children?.findIndex(it => isString(it) || isNumber(it)) : -1;
			const _attributeValue = { ...children.props, children: _children[findIndex] };

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
		setDataMap,
		reload: debounceReload,
		setAstJson,
	};
};
export default useLowCodeContext;
