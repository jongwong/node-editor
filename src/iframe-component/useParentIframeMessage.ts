import { useEffect, useRef } from 'react';

import { omit, pick } from 'lodash';

import { LowCodeMessageEvent } from '@/constant/message-event';
import { useCurrentItemChildId, useCurrentItemId } from '@/iframe-component/useIframeInstance';
import { postMessageToChild, wrapperMessage } from '@/iframe-component/utils';
import {
	useDataRefTimeAtom,
	useLowCodeInstance,
} from '@/LowCode/ASTEditor/ASTExplorer/useLowCodeContext';
import { onItemDropASTHandle } from '@/LowCode/ASTEditor/utils/ast-node/move';
import emitter from '@/utils/event';

function useParentIframeMessage(getInstanceData: () => any) {
	const {
		currentItemId,
		currentItemChildId,
		getASTJson,
		updateASTJson,
		AstJson,
		getNodeById,
		transformCode,
	} = useLowCodeInstance();
	const [dataRefTime] = useDataRefTimeAtom();
	const readyRef = useRef(false);
	const [_, setCurrentItemId] = useCurrentItemId();
	const [_currentItemChildId, setCurrentItemChildId] = useCurrentItemChildId();
	const postCurrentItemId = () => {
		postMessageToChild(LowCodeMessageEvent.CurrentItemId, currentItemId);
	};
	const postCurrentItemChildId = () => {
		postMessageToChild(LowCodeMessageEvent.CurrentItemChildId, currentItemChildId);
	};
	const postTransformCode = () => {
		postMessageToChild(LowCodeMessageEvent.TransformCode, transformCode);
	};
	const postAstJson = () => {
		postMessageToChild(LowCodeMessageEvent.AstJson, transformCode);
	};
	const ins = getInstanceData();

	const postInstanceData = () => {
		const ob = ins?.getNonePathIdMap();
		const newOb: any = {};
		Object.keys(ob).forEach(it => {
			newOb[it] = pick(
				{
					...ob[it],
				},
				['pathKey', 'name']
			);
		});
		const val = {
			nonePathIdMap: newOb,
			ASTJson: ins?.getASTJson(),
		};
		postMessageToChild(LowCodeMessageEvent.LowcodeInstanceData, val);
	};
	useEffect(() => {
		if (readyRef.current) {
			postInstanceData();
		}
		function handleMessage(e: any) {
			const { app, type, payload } = e.data;

			// Ensure message is from the correct source
			if (app !== 'lowcode') return;

			switch (type) {
				case LowCodeMessageEvent.IframeReady:
					readyRef.current = true;
					postInstanceData();

					postTransformCode();
					postAstJson();

					setTimeout(() => {
						postCurrentItemId();
						postCurrentItemChildId();
					}, 30);
					break;
				case LowCodeMessageEvent.OnItemDrop:
					onItemDropASTHandle?.(
						{
							item: payload.item,
							container: payload.container,
							getNodeById,
						},
						() => {
							const astJson = getASTJson();
							updateASTJson(astJson);
						}
					);
					break;

				case LowCodeMessageEvent.LowCodeDragItemDoubleClick:
					// eslint-disable-next-line no-case-declarations
					const { _low_code_id, _low_code_child_id } = payload.item;
					emitter.emit(LowCodeMessageEvent.AttributeValueChange, payload.attributeValue);

					setCurrentItemId(_low_code_id);
					setCurrentItemChildId(_low_code_child_id);
					break;
				default:
					break;
			}
		}
		window.addEventListener('message', handleMessage);

		// Cleanup event listener on component unmount
		return () => window.removeEventListener('message', handleMessage);
	}, [currentItemId, AstJson, transformCode, dataRefTime]);

	// Send currentItemId updates
	useEffect(() => {
		if (!readyRef.current) {
			return;
		}
		postCurrentItemId();
	}, [currentItemId]);

	// Send currentItemChildId updates
	useEffect(() => {
		if (!readyRef.current) {
			return;
		}
		postCurrentItemChildId();
	}, [currentItemChildId]);

	// Send transformCode updates
	useEffect(() => {
		if (!readyRef.current) {
			return;
		}

		postTransformCode();
	}, [transformCode]);

	// Send ast updates
	useEffect(() => {
		if (!readyRef.current) {
			return;
		}
		postAstJson();
	}, [AstJson]);
}

export default useParentIframeMessage;
export const postDraggingStateChange = (e: boolean) => {
	postMessageToChild(LowCodeMessageEvent.DraggingStateChange, e);
};
