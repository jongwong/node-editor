import React, { useContext, useEffect, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import classNames from 'classnames';
import { set } from 'lodash';

import { useLowCodeInstance } from '@/LowCode/ASTEditor/ASTExplorer/useLowCodeContext';
import { EDragItemType, EOperationClassName } from '@/LowCode/ASTEditor/constants';
import {
	getJSXElementName,
	logAstJsxIndex,
	renderNodeName,
} from '@/LowCode/ASTEditor/utils/ast-node';
import { onItemDrop } from '@/LowCode/ASTEditor/utils/ast-node/move';
import { hasDraggingElement } from '@/LowCode/ASTEditor/utils/dom';
import {
	addClassName,
	clearClosest,
	removeClassName,
} from '@/LowCode/ASTEditor/utils/dom/class-operation';
import { hasClassName } from '@/LowCode/util';

import ErrorBound from '../ErrorBound';

type LowCodeDragItemProps = {
	children?: React.ReactNode;
	_low_code_child_id: string;
};

const LowCodeDragItem: React.FC<LowCodeDragItemProps> = props => {
	// eslint-disable-next-line react/prop-types
	const { _low_code_child_id, _low_code_id, _low_code_parent_id, ...rest } = props;

	const {
		getNodeById,
		ast,
		getTestNonePathMap,
		getAst,
		onComponentDoubleClick,
		getPathKeyById,
		currentItemId,
		updateAst,
	} = useLowCodeInstance();

	const curData = getNodeById(_low_code_id);
	const childNode = getNodeById(_low_code_child_id);

	const name = childNode ? renderNodeName(childNode) : '';
	const item = { uuid: _low_code_id, parentId: _low_code_parent_id, name };
	const [{ isDragging }, dragRef, previewRef] = useDrag(
		() => ({
			type: 'LowCodeDragItem',
			item: item,
			canDrag: () => {
				addClassName(document.body, 'low-code-container__dragging');

				return true;
			},
			end: () => {
				const el: HTMLElement = document.querySelector('.low-code-container-closest');
				if (el) {
					const containerId = el.getAttribute('_low_code_id');
					const containerParentId = el.getAttribute('_low_code_parent_id');

					onItemDrop(
						{ item, getNodeById, containerId, containerParentId },
						(moveParentNode, targetParentNode) => {
							const astJson = getAst();
							updateAst?.(astJson);
						}
					);
				}
				setTimeout(() => {
					removeClassName(document.body, 'low-code-container__dragging');
					clearClosest();
				}, 200);
			},
			collect: (monitor: any) => ({
				isDragging: monitor.isDragging(),
			}),
		}),
		[ast, _low_code_id, _low_code_parent_id]
	);

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
				opacity: isDragging ? '0.3' : 'unset',
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
