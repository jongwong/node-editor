import React, { useEffect, useRef } from 'react';

import { atom, useAtomValue, useSetAtom } from 'jotai';
import { useAtom } from 'jotai/index';
import { get } from 'lodash';

import { LowCodeMessageEvent } from '@/constant/message-event';
import emmiter from '@/iframe-component/emmiter';
import { getMessageReactProps, isIframe, postMessageToParent } from '@/iframe-component/utils';
import { findNodePathLocationByUid } from '@/LowCode/ASTEditor/utils/ast-node';
import {
	addClassName,
	clearClosest,
	removeClassName,
} from '@/LowCode/ASTEditor/utils/dom/class-operation';

// Define atoms to hold the received state values
export const currentItemIdAtom = atom('');
export const currentItemChildIdAtom = atom('');
export const transformCodeAtom = atom('');
export const astJsonAtom = atom({});

export const IframeListenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const setCurrentItemId = useSetAtom(currentItemIdAtom);
	const setCurrentItemChildId = useSetAtom(currentItemChildIdAtom);
	const setTransformCode = useSetAtom(transformCodeAtom);
	const setAstJson = useSetAtom(astJsonAtom);
	const transformCode = useAtomValue(transformCodeAtom);

	const childMapMap = useRef({});
	const postReadyMessage = () => {
		postMessageToParent(LowCodeMessageEvent.IframeReady, true);
	};
	const postPropsChangeMessage = e => {
		postMessageToParent(LowCodeMessageEvent.SendAttributeValue, e);
	};
	useEffect(() => {
		emmiter.on('item-children-change', e => {
			childMapMap.current[e.item._low_code_child_id] = e;
		});

		function handleMessage(e: any) {
			const { app, type, payload } = e.data;

			// Ensure message is from the correct source
			if (app !== 'lowcode') return;
			// Update state based on the message type
			switch (type) {
				case LowCodeMessageEvent.CurrentItemId:
					setCurrentItemId(payload);
					break;
				case LowCodeMessageEvent.CurrentItemChildId:
					setCurrentItemChildId(payload);
					break;
				case LowCodeMessageEvent.TransformCode:
					setTransformCode(payload);
					break;
				case LowCodeMessageEvent.AstJson:
					setAstJson(payload);
					break;
				case LowCodeMessageEvent.LowcodeInstanceData:
					window.lowcodeInstanceData = payload;
					break;
				case LowCodeMessageEvent.AskAttributeValue:
					// eslint-disable-next-line no-case-declarations
					const find = childMapMap.current[payload._low_code_child_id];

					if (find) {
						const isEl = React.isValidElement(find?.children) && find?.children?.props;

						const val = {
							item: payload,
							type: isEl ? 'ReactNode' : 'Other',
							attributeValue: isEl ? getMessageReactProps(find?.children?.props) : {},
						};
						postPropsChangeMessage(val);
					}

					break;
				case LowCodeMessageEvent.DraggingStateChange:
					if (payload) {
						addClassName(document.body, 'low-code-container__dragging');
					} else {
						removeClassName(document.body, 'low-code-container__dragging');
						clearClosest();
					}

					break;
				default:
					console.warn(`Unknown message type: ${type}`);
			}
		}

		window.addEventListener('message', handleMessage);
		postReadyMessage();
		// Cleanup event listener on component unmount
		return () => window.removeEventListener('message', handleMessage);
	}, []);

	return <>{transformCode || !isIframe() ? children : null}</>;
};

const useIframeInstance = () => {
	const getInsData = (): {
		ASTJson: any;
		nonePathIdMap: any;
	} => {
		return window.lowcodeInstanceData;
	};
	const getPathKeyById = (id: string) => {
		const insData = getInsData();
		const ob = insData?.nonePathIdMap || {};
		const find = ob[id]?.pathKey;

		if (find) {
			return find;
		}
		return findNodePathLocationByUid(insData?.ASTJson || {}, id);
	};
	return {
		getNodeById: (id: string) => {
			const insData = getInsData();
			const _path = getPathKeyById(id);

			const ast = insData?.ASTJson || {};
			return get(ast, _path);
		},
		getASTJson: () => {
			const insData = getInsData();

			return insData?.ASTJson || {};
		},
	};
};

export default useIframeInstance;
export const useTransformCode = () => {
	return useAtom(transformCodeAtom);
};

export const useASTJson = () => {
	return useAtom(astJsonAtom);
};

export const useCurrentItemId = () => {
	return useAtom(currentItemIdAtom);
};
export const useCurrentItemChildId = () => {
	return useAtom(currentItemChildIdAtom);
};

export const onItemDrop = (op: {
	item: { id: string; parentId: string };
	container: { id: string; parentId: string };
}) => {
	postMessageToParent(LowCodeMessageEvent.OnItemDrop, op);
};
