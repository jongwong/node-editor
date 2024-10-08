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
	const onItemDrop = item => {
		const astJson = getAst();
		const moveNode = getNodeById(item.uuid);

		const moveParentNode = getNodeById(item.parentId);
		const targetParentNode = getNodeById(_low_code_parent_id);

		const targetNode = getNodeById(uuid);
		console.log('======moveParentNode====>', logChildren(moveParentNode));
		console.log('======targetParentNode====>', logChildren(targetParentNode));

		const curIndex = getIndexByParent(moveParentNode, moveNode);

		const targetIndex = getIndexByParent(targetParentNode, targetNode);

		if (curIndex < 0 || targetIndex < 0) {
			return;
		}
		if (item.parentId === _low_code_parent_id) {
			moveParentNode.children[curIndex] = targetNode;
			moveParentNode.children[targetIndex] = moveNode;

			const ob = getTestNonePathMap();

			moveParentNode.children = reInsertContainer(moveParentNode);
		} else {
			moveParentNode.children.splice(curIndex, 1);
			targetParentNode.children.splice(targetIndex, 0, moveNode);

			moveParentNode.children = reInsertContainer(moveParentNode);
			targetParentNode.children = reInsertContainer(targetParentNode);
		}
		updateAst?.(astJson, item.uuid);
	};
	const onMaterialItemDrop = item => {
		const astJson = getAst();
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
		[astJsonData, uuid]
	);
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

	return (
		<div
			className={classNames(
				'low-code-container',
				direction && 'low-code-container-' + direction,
				isOverCurrent && 'low-code-container__overing'
			)}
			ref={e => {
				curRef.current = e;
				dropRef(e);
			}}
		>
			<span className={'low-code-container-label'}>
				{isOverCurrent ? `${getJSXElementName(parentNode)}` : null}
			</span>
		</div>
	);
};

export default LowCodeItemContainer;
window.LowCodeItemContainer = LowCodeItemContainer;
