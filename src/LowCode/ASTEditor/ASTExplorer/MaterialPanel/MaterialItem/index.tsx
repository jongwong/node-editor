import React, { useContext, useEffect, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import { cloneDeep, set } from 'lodash';

import { postDraggingStateChange } from '@/iframe-component/useParentIframeMessage';
import { getMaterialModule } from '@/LowCode/ASTEditor/ASTExplorer/MaterialPanel/utils';
import { useLowCodeInstance } from '@/LowCode/ASTEditor/ASTExplorer/useLowCodeContext';
import { EDragItemType } from '@/LowCode/ASTEditor/constants';
import {
	onItemDrop,
	onItemDropASTHandle,
	onMaterialItemDrop,
} from '@/LowCode/ASTEditor/utils/ast-node/move';
import { addClassName, removeClassName } from '@/LowCode/ASTEditor/utils/dom/class-operation';

const MaterialItem: React.FC<{
	data: any;
	children?: React.ReactNode;
}> = props => {
	const { data, ...rest } = props;
	const [moduleState, setModuleState] = useState<any>();
	const { getPathKeyById, getNodeById, getASTJson, updateASTJson } = useLowCodeInstance();
	const item = {
		type: EDragItemType.MaterialItem,
		materialData: data,
	};
	const [{ isDragging }, dragRef, previewRef] = useDrag(() => ({
		type: EDragItemType.MaterialItem,
		item,
		canDrag: () => {
			postDraggingStateChange(true);
			return true;
		},
		end: () => {
			const iframe = document.getElementById('lowcode-preview') as HTMLIFrameElement;
			const _document = iframe?.contentWindow?.document;
			const el: HTMLElement | null | undefined = _document?.querySelector(
				'.low-code-container-closest'
			);
			if (el) {
				const containerId = el.getAttribute('_low_code_id');
				const containerParentId = el.getAttribute('_low_code_parent_id');
				const old = cloneDeep(getASTJson());
				try {
					onMaterialItemDrop?.(
						{
							item: item,
							container: {
								id: containerId,
								parentId: containerParentId,
							},
							getNodeById,
							getASTJson,
							getPathKeyById,
						},
						e => {
							setTimeout(() => {
								postDraggingStateChange(false);
							}, 100);

							updateASTJson(e);
						}
					);
				} catch (e) {
					console.error(e);
					updateASTJson(old);
					setTimeout(() => {
						postDraggingStateChange(false);
					}, 100);
				}
			}
		},
		collect: (monitor: any) => ({
			isDragging: monitor.isDragging(),
		}),
	}));
	useEffect(() => {
		setTimeout(() => {
			setModuleState(getMaterialModule(data.name, data.import));
		}, 1000);
	}, [data]);

	return (
		<>
			<div
				style={{ width: '100px', height: '100px', border: '1px solid #eee' }}
				ref={e => {
					dragRef(e);
				}}
			>
				<span style={{ lineHeight: '100px' }}>{data.name}</span>
			</div>
		</>
	);
};
export default MaterialItem;
