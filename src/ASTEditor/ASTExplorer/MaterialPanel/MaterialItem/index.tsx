import React, { useContext, useEffect, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import { getMaterialModule } from '@/ASTEditor/ASTExplorer/MaterialPanel/utils';
import { LowCodeContext } from '@/ASTEditor/ASTExplorer/useLowCodeContext';
import { EDragItemType } from '@/ASTEditor/constants';
import { addClassName, removeClassName } from '@/ASTEditor/util/dom/class-operation';

const MaterialItem: React.FC<{
	data: any;
	children?: React.ReactNode;
}> = props => {
	const { data, ...rest } = props;
	const { dataMap, onComponentDoubleClick, currentItemId, onItemHover, astJson, onAstChange } =
		useContext(LowCodeContext);
	const [ModuleState, setModuleState] = useState<any>();
	const [{ isDragging }, dragRef, previewRef] = useDrag(() => ({
		type: EDragItemType.MaterialItem,
		item: {
			type: EDragItemType.MaterialItem,
			materialData: data,
		},
		canDrag: () => {
			setTimeout(() => {
				addClassName(document.body, 'low-code-container__dragging');
			}, 100);
			return true;
		},
		end: () => {
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
