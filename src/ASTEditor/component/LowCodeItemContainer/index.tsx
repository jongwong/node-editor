import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useDrag, useDragLayer, useDrop } from 'react-dnd';

import classNames from 'classnames';
import { get, last, set, take } from 'lodash';

import { EDragItemType } from '@/ASTEditor/constants';
import { LowCodeContext } from '@/ASTEditor/util';
import { findNodeByUid, getJSXElementName } from '@/ASTEditor/util/ast-node';

type LowCodeItemContainerProps = {
	children?: React.ReactNode;
	_low_code_id: string;
};

const LowCodeItemContainer: React.FC<LowCodeItemContainerProps> = props => {
	// eslint-disable-next-line react/prop-types
	const { _low_code_id: uuid, ...rest } = props;
	const { astJson, onAstChange, dataMap } = useContext(LowCodeContext);

	const { curData, parentNode } = useMemo(() => {
		const find = findNodeByUid(astJson, uuid);
		const parentNode = get(astJson, take(find.pathList, find.pathList.length - 2));
		return {
			curData: find.node,
			parentNode: parentNode,
		};
	}, [astJson, uuid]);
	const [{ isOver, isOverCurrent }, dropRef] = useDrop(
		() => ({
			accept: EDragItemType.LowCodeDragItem,
			drop: (item, monitor) => {
				const targetFind = findNodeByUid(astJson, uuid);
				const targetPath = take(targetFind.pathList, targetFind.pathList.length - 1);

				const moveFind = findNodeByUid(astJson, item.uuid);
				const movePath = take(moveFind.pathList, moveFind.pathList.length - 1);
				const targetChild = get(astJson, targetPath);
				const moveChild: any[] = get(astJson, movePath);
				const targetIndex = +last(targetFind.pathList);
				const moveIndex = +last(moveFind.pathList);
				let takeList = [];
				let lIdx = moveIndex;
				let rIdx = moveIndex;
				let rd = false;
				let ld = false;
				while (!ld || !rd) {
					if (lIdx === rIdx) {
						takeList.push(moveChild[lIdx]);
					} else {
						if (!ld && lIdx >= 0) {
							takeList = [moveChild[lIdx], ...takeList];
							if (getJSXElementName(moveChild[lIdx]) === 'LowCodeItemContainer') {
								ld = true;
							}
						}

						if (!rd && rIdx < moveChild.length) {
							takeList = [...takeList, moveChild[rIdx]];
							if (getJSXElementName(moveChild[rIdx]) === 'LowCodeItemContainer') {
								rd = true;
							}
						}
					}
					if (!ld) {
						lIdx = lIdx - 1;
					}
					if (!rd) {
						rIdx = rIdx + 1;
					}
				}

				moveChild.splice(lIdx, takeList.length, targetFind.node);
				targetChild.splice(targetIndex, 1, ...takeList);
				set(astJson, movePath, moveChild);
				set(astJson, targetPath, targetChild);
				onAstChange?.(astJson);
			},
			collect: monitor => {
				return {
					// 是否放置在目标上
					isOver: monitor.isOver(),

					isOverCurrent: monitor.isOver({ shallow: true }),
				};
			},
		}),
		[astJson, uuid]
	);

	return (
		<div
			className={classNames('low-code-container', isOverCurrent && 'low-code-container__dropping')}
			ref={dropRef}
		>
			<span>{isOverCurrent ? `parent: ${parentNode?.openingElement?.name?.name}` : null}</span>
		</div>
	);
};

export default LowCodeItemContainer;
window.LowCodeItemContainer = LowCodeItemContainer;
