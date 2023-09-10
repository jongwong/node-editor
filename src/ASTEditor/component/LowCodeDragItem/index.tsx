import React, { useContext, useEffect, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import classNames from 'classnames';

import { EOperationClassName } from '@/ASTEditor/constants';
import { LowCodeContext } from '@/ASTEditor/util';
import { hasDraggingElement } from '@/ASTEditor/util/dom';
import { addClassName, removeClassName } from '@/ASTEditor/util/dom/class-operation';
import { hasClassName } from '@/util';

type LowCodeDragItemProps = {
	children?: React.ReactNode;
	_low_code_child_id: string;
};

const LowCodeDragItem: React.FC<LowCodeDragItemProps> = props => {
	// eslint-disable-next-line react/prop-types
	const { _low_code_child_id, _low_code_id, ...rest } = props;
	const { dataMap, onComponentDoubleClick, currentItemId, onItemHover } =
		useContext(LowCodeContext);
	const curData = dataMap?.[_low_code_id];
	const name = dataMap[_low_code_child_id].name;
	const [{ isDragging }, dragRef, previewRef] = useDrag(() => ({
		type: 'LowCodeDragItem',
		item: { uuid: _low_code_id, name },
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
	const elRef = useRef();

	const isSelect = currentItemId === _low_code_id;
	return (
		<div
			className={classNames(
				'low-code-target-item',
				isDragging && 'low-code-target-item__dragging',
				isSelect && 'low-code-target-item__select'
			)}
			ref={e => {
				elRef.current = e;
				previewRef(e);
				dragRef(e);
			}}
			style={{
				display: curData?.materialData?.display || 'block',
				opacity: isDragging ? '0' : 'unset',
				overflow: isDragging || isSelect ? 'auto' : undefined,
			}}
			onDoubleClick={e => {
				onComponentDoubleClick?.(_low_code_id, { data: curData, proxyProps: { ...rest } });
				e.stopPropagation();
				return false;
			}}
			onMouseOver={e => {
				if (!elRef.current || hasDraggingElement()) {
					e.stopPropagation();
					return;
				}
				const find = elRef.current;
				if (find && !hasClassName(find, EOperationClassName.LowCodeTargetItemHover)) {
					addClassName(find, EOperationClassName.LowCodeTargetItemHover);
				}

				e.stopPropagation();
			}}
			onMouseOut={e => {
				if (!elRef.current) {
					e.stopPropagation();
					return;
				}
				removeClassName(elRef.current, EOperationClassName.LowCodeTargetItemHover);

				e.stopPropagation();
			}}
		>
			<span className={'low-code-target-item__menu'}>
				<span>{name}</span>
			</span>
			{props.children}
		</div>
	);
};
export default LowCodeDragItem;
window.LowCodeDragItem = LowCodeDragItem;
