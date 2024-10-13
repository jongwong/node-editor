import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useDrag, useDragLayer, useDrop } from 'react-dnd';

import traverse, { NodePath } from '@babel/traverse';
import {
	importDeclaration,
	importDefaultSpecifier,
	importSpecifier,
	isImportDeclaration,
	jSXText,
	jsxText,
	stringLiteral,
} from '@babel/types';
import classNames from 'classnames';
import { findIndex, findLastIndex, get, last, set, take, toPath } from 'lodash';

import { useLowCodeInstance } from '@/ASTEditor/ASTExplorer/useLowCodeContext';
import { EDragItemType } from '@/ASTEditor/constants';
import {
	addEditMark,
	reInsertContainer,
	removeEditMark,
	removeEditMarkAst,
} from '@/ASTEditor/util';
import {
	findNodeByUid,
	getIndexByParent,
	getJSXElementName,
	getUUidByNode,
	logChildren,
	wrapperJSXElement,
} from '@/ASTEditor/util/ast-node';
import { isHorizontalOrVertical } from '@/ASTEditor/util/dom';
import { addClassName, clearClosest } from '@/ASTEditor/util/dom/class-operation';
import { hasClassName } from '@/util';

type LowCodeItemContainerProps = {
	children?: React.ReactNode;
	_low_code_id: string;
};

const LowCodeItemContainer: React.FC<LowCodeItemContainerProps> = props => {
	// eslint-disable-next-line react/prop-types
	const { _low_code_id: uuid, _low_code_parent_id, ...rest } = props;
	const {
		getAst,
		astJson: astJsonData,
		getNodeById,
		getPathKeyById,
		getTestNonePathMap,
		currentItemId,
		getPathById,
		updateAst,
	} = useLowCodeInstance();
	const curRef = useRef<HTMLDivElement | null>();
	const parentNode = useMemo(
		() => getNodeById(_low_code_parent_id),
		[currentItemId, uuid, _low_code_parent_id]
	);

	const lastItemRef = useRef();
	const [{ isOver, isOverCurrent, item }, dropRef] = useDrop(
		() => ({
			accept: [EDragItemType.LowCodeDragItem, EDragItemType.MaterialItem],
			collect: monitor => {
				return {
					// 是否放置在目标上
					isOver: monitor.isOver(),
					item: monitor.getItem(),
					isOverCurrent: monitor.isOver({ shallow: true }),
				};
			},
		}),
		[astJsonData, uuid]
	);
	useEffect(() => {
		if (item) {
			lastItemRef.current = item;
		}
	}, [item]);

	const [direction, setDirection] = useState();
	const getDirection = () => {
		if (curRef.current) {
			return isHorizontalOrVertical(curRef.current);
		}
		return 'vertical';
	};
	useEffect(() => {
		if (!curRef.current) {
			return;
		}
		const d = getDirection();
		if (d !== direction) {
			setDirection(d);
		}
	}, [curRef.current]);

	const ob = {
		_low_code_id: uuid,
		_low_code_parent_id: _low_code_parent_id,
	};
	return (
		<div
			className={classNames('low-code-container', direction && 'low-code-container-' + direction)}
			{...ob}
			ref={e => {
				curRef.current = e;
				dropRef(e);
			}}
		>
			<span className={'low-code-container-label'}>{getJSXElementName(parentNode)}</span>
		</div>
	);
};

export default LowCodeItemContainer;
window.LowCodeItemContainer = LowCodeItemContainer;
