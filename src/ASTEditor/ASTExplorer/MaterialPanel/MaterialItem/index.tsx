import React, { useContext, useEffect, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import { set } from 'lodash';

import { getMaterialModule } from '@/ASTEditor/ASTExplorer/MaterialPanel/utils';
import { useLowCodeInstance } from '@/ASTEditor/ASTExplorer/useLowCodeContext';
import { EDragItemType } from '@/ASTEditor/constants';
import { onItemDrop, onMaterialItemDrop } from '@/ASTEditor/util/ast-node/move';
import { addClassName, removeClassName } from '@/ASTEditor/util/dom/class-operation';

const MaterialItem: React.FC<{
	data: any;
	children?: React.ReactNode;
}> = props => {
	const { data, ...rest } = props;
	const [ModuleState, setModuleState] = useState<any>();
	const { getAst, getPathKeyById, getNodeById, updateAst } = useLowCodeInstance();
	const item = {
		type: EDragItemType.MaterialItem,
		materialData: data,
	};
	const [{ isDragging }, dragRef, previewRef] = useDrag(() => ({
		type: EDragItemType.MaterialItem,
		item,
		canDrag: () => {
			setTimeout(() => {
				addClassName(document.body, 'low-code-container__dragging');
			}, 100);
			return true;
		},
		end: () => {
			const el: HTMLElement = document.querySelector('.low-code-container-closest');
			if (el) {
				const containerId = el.getAttribute('_low_code_id');
				const containerParentId = el.getAttribute('_low_code_parent_id');

				onMaterialItemDrop({
					item,
					getNodeById,
					getPathKeyById,
					getAst,
					updateAst,
					containerParentId,
					containerId,
				});
			}

			setTimeout(() => {
				removeClassName(document.body, 'low-code-container__dragging');
			}, 100);
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
