import traverse from '@babel/traverse';
import {
	importDeclaration,
	importSpecifier,
	isImportDeclaration,
	jsxText,
	stringLiteral,
} from '@babel/types';
import { findLastIndex, isNil, set } from 'lodash';

import {
	reInsertContainer,
	removeEditMarkAst,
	resetFlatChildrenItemRemark,
} from '@/LowCode/ASTEditor/utils';
import {
	findNodeByUid,
	getAttributeValue,
	getIndexByParent,
	getUUidByNode,
	logAstJsxIndex,
	logChildren,
	wrapperJSXElement,
} from '@/LowCode/ASTEditor/utils/ast-node/index';

export const onItemDropASTHandle = ({ item, getNodeById, container }, cb) => {
	const moveNode = getNodeById(item.id);
	let moveParentNode = getNodeById(item.parentId);
	const targetNode = getNodeById(container.id);
	let targetParentNode = getNodeById(container.parentId);
	const curIndex = getIndexByParent(moveParentNode, moveNode);
	const targetIndex = getIndexByParent(targetParentNode, targetNode);

	if (curIndex < 0 || targetIndex < 0 || !moveParentNode || !targetParentNode) {
		throw Error('找不到targetParentNode或moveParentNode');
	}

	if (item.parentId === container.parentId) {
		moveParentNode.children[curIndex] = targetNode;
		moveParentNode.children[targetIndex] = moveNode;
		moveParentNode = resetFlatChildrenItemRemark(moveParentNode);
	} else {
		moveParentNode.children.splice(curIndex, 1);
		targetParentNode.children.splice(targetIndex, 0, moveNode);

		moveParentNode = resetFlatChildrenItemRemark(moveParentNode);
		targetParentNode = resetFlatChildrenItemRemark(targetParentNode);
	}

	cb(moveParentNode, targetParentNode);
};
export const onMaterialItemDrop = (
	{
		item,
		container,
		getASTJson,
		getNodeById,
		getPathKeyById,
	}: {
		item: any;
		container: {
			id: string;
			parentId: string;
		};
		getASTJson: () => any;
		getNodeById: (id: string) => any;
		getPathKeyById: (id: string) => string;
	},
	cb: (ast: any) => void
) => {
	const astJson = getASTJson();
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

	const targetFindPath = getPathKeyById(container.parentId);

	let targetFind = getNodeById(container.parentId);
	const idx = targetFind?.children?.findIndex(it => getUUidByNode(it) === container.id);

	if (idx < 0 || isNil(idx)) {
		return;
	}
	targetFind.children.splice(idx, 0, newElNode);

	targetFind = resetFlatChildrenItemRemark(targetFind);

	set(astJson, targetFindPath, targetFind);
	logAstJsxIndex(astJson, 'Card', 0, true);
	cb(astJson);
};
