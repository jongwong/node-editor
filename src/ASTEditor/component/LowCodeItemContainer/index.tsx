import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useDrag, useDragLayer, useDrop } from 'react-dnd';

import traverse from '@babel/traverse';
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
import { findLastIndex, get, last, set, take, toPath } from 'lodash';

import { useLowCodeInstance } from '@/ASTEditor/ASTExplorer/useLowCodeContext';
import { EDragItemType } from '@/ASTEditor/constants';
import { addEditMark, removeEditMark, removeEditMarkAst } from '@/ASTEditor/util';
import { findNodeByUid, getJSXElementName, wrapperJSXElement } from '@/ASTEditor/util/ast-node';

type LowCodeItemContainerProps = {
	children?: React.ReactNode;
	_low_code_id: string;
};

const LowCodeItemContainer: React.FC<LowCodeItemContainerProps> = props => {
	// eslint-disable-next-line react/prop-types
	const { _low_code_id: uuid, _parent_uid, ...rest } = props;
	const { getNodeById, ast: astJson } = useLowCodeInstance();
	const curData = getNodeById(uuid);
	const parentNode = getNodeById(_parent_uid);

	const onItemDrop = item => {
		const targetFind = findNodeByUid(astJson, uuid);

		const moveFind = findNodeByUid(astJson, item.uuid);

		set(astJson, moveFind?.pathList, targetFind.node);
		set(astJson, targetFind.pathList, moveFind.node);

		updateAst?.(astJson);
	};
	const onMaterialItemDrop = item => {
		const importName = item?.materialData?.import;
		const name = item?.materialData?.name;
		let find = false;

		const updateImportSpecifiers = node => {
			const hasSpec = node.specifiers?.some(it => it?.imported?.name === name);
			const val = importSpecifier(
				{
					type: 'Identifier',
					name: name,
				},
				{
					type: 'Identifier',
					name: name,
				}
			);
			if (!hasSpec) {
				node.specifiers.push(val);
			}
		};
		traverse(astJson, {
			enter: path => {
				const node = path.node;

				if (isImportDeclaration(node) && node?.source?.value === importName) {
					find = true;
					updateImportSpecifiers(node);
				}
			},
			exit: (path, state) => {
				if (path.node.type !== 'Program' || find) {
					return;
				}
				const newNode = importDeclaration([], stringLiteral(importName));
				updateImportSpecifiers(newNode);
				const lastIndex = findLastIndex(path?.node?.body, it => isImportDeclaration(it));
				path.node.body.splice(lastIndex + 1, 0, newNode);
			},
		});

		const child = [];
		const findChild = item?.materialData?.attribute?.find(it => it?.withTextChildren);
		if (findChild) {
			const val = item?.materialData?.defaultAttributeValue[findChild?.name] || name;
			child.push(jsxText(val));
		}
		const newElNode = wrapperJSXElement(name, child);

		const targetFind = findNodeByUid(astJson, uuid);
		if (targetFind?.pathList) {
			set(astJson, targetFind.pathList, newElNode);
		}
		updateAst(astJson);
	};
	const [{ isOver, isOverCurrent }, dropRef] = useDrop(
		() => ({
			accept: [EDragItemType.LowCodeDragItem, EDragItemType.MaterialItem],
			drop: (item, monitor) => {
				if (item?.type === EDragItemType.MaterialItem) {
					onMaterialItemDrop(item);
				} else {
					onItemDrop(item);
				}
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
			<span>{isOverCurrent ? `${parentNode?.openingElement?.name?.name}` : null}</span>
		</div>
	);
};

export default LowCodeItemContainer;
window.LowCodeItemContainer = LowCodeItemContainer;
