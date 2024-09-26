import React, { useContext, useEffect, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import classNames from 'classnames';

import { useLowCodeInstance } from '@/ASTEditor/ASTExplorer/useLowCodeContext';
import { EOperationClassName } from '@/ASTEditor/constants';
import { getJSXElementName } from '@/ASTEditor/util/ast-node';
import { hasDraggingElement } from '@/ASTEditor/util/dom';
import { addClassName, removeClassName } from '@/ASTEditor/util/dom/class-operation';
import { hasClassName } from '@/util';

import ErrorBound from '../ErrorBound';

type LowCodeDragItemProps = {
	children?: React.ReactNode;
	_low_code_child_id: string;
};

const LowCodeDragItem: React.FC<LowCodeDragItemProps> = props => {
	// eslint-disable-next-line react/prop-types
	const { _low_code_child_id, _low_code_id, ...rest } = props;
	const { getNodeById, onComponentDoubleClick, currentItemId } = useLowCodeInstance();
	const curData = getNodeById(_low_code_id);
	const childNode = getNodeById(_low_code_child_id);
	const name = childNode ? getJSXElementName(childNode) : '';
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
	const elRef = useRef<HTMLElement>();

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
				display: curData?.config?.display || 'inline',
				opacity: isDragging ? '0' : 'unset',
				overflow: isDragging || isSelect ? 'auto' : undefined,
			}}
			onDoubleClick={e => {
				const _curData = getNodeById(_low_code_child_id);
				onComponentDoubleClick?.(props, _curData);

				e.stopPropagation();
				e.preventDefault();
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
			<ErrorBound>{props.children}</ErrorBound>
		</div>
	);
};
export default LowCodeDragItem;
window.LowCodeDragItem = LowCodeDragItem;
