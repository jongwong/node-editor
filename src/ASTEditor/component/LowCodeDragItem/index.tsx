import React, { useContext, useRef } from 'react';

import { cloneDeep, forEach } from 'lodash';

import { EOperationClassName } from '@/ASTEditor/constants';
import { LowCodeContext } from '@/ASTEditor/util';
import { findParentNode, isHoverTarget } from '@/ASTEditor/util/dom';
import { addClassName, removeClassName } from '@/ASTEditor/util/dom/class-operation';
import { hasClassName } from '@/util';

type LowCodeDragItemProps = {
	children?: React.ReactNode;
	lowCodeItemUId: string;
};
const LowCodeDragItem: React.FC<LowCodeDragItemProps> = props => {
	const { lowCodeItemUId: uuid, ...rest } = props;
	const { dataMap, onComponentDoubleClick } = useContext(LowCodeContext);
	const curData = dataMap?.[uuid];
	const elRef = useRef<HTMLElement | undefined>();
	return (
		<div
			className={'low-code-target-item'}
			ref={elRef}
			style={{ display: curData?.materialData?.display || 'block' }}
			onDoubleClick={e => {
				onComponentDoubleClick?.(uuid, { data: curData, proxyProps: { ...rest } });
				e.stopPropagation();
				return false;
			}}
			onMouseOver={e => {
				if (!elRef.current) {
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
					return;
				}

				removeClassName(elRef.current, EOperationClassName.LowCodeTargetItemHover);
				e.stopPropagation();
			}}
		>
			{props.children}
		</div>
	);
};
export default LowCodeDragItem;
