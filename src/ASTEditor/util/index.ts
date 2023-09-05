import { createContext } from 'react';

import generate from '@babel/generator';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import {
	assertJSX,
	isIdentifier,
	isImportDeclaration,
	isImportOrExportDeclaration,
	isJSX,
	isJSXAttribute,
	isModuleSpecifier,
	JSX,
	jsxAttribute,
	jsxIdentifier,
	Node,
	StringLiteral,
	stringLiteral,
} from '@babel/types';
import { forEach, forEachRight, forIn, isArray, isObject, set } from 'lodash';
import { v4 as uuid } from 'uuid';

import materialStore from '@/ASTEditor/ASTExplorer/material-store';
import { getJSXElementName, wrapperJSXElement } from '@/ASTEditor/util/ast-node';

export const toAst = (code: string) => {
	const ast = parse(code, { sourceType: 'module', plugins: ['typescript', 'jsx'] });

	return ast;
};

export const generateCode = (ast, code) => {
	return generate(ast, {}, code) || '';
};

const addAttrMark = (ast: string) => {
	const idMap = {};
	traverse(ast, {
		enter(path) {
			materialStore.data.forEach(it => {
				if (isJSX(path.node, { type: 'JSXElement' })) {
					const name = getJSXElementName(path.node);
					const valid = name === it.name;
					if (valid && getJSXElementName(path.parent) !== 'LowCodeDragItem') {
						const ob = {
							uuid: uuid(),
							config: it,
							node: path?.node,
							path,
						};

						const attributes = path?.node?.openingElement?.attributes;
						const curNode = wrapperJSXElement('LowCodeDragItem', path.node, [
							...attributes,
							jsxAttribute(jsxIdentifier('lowCodeItemUId'), stringLiteral(ob.uuid)),
						]);
						path.replaceWith(curNode);

						idMap[ob.uuid] = ob;
					}
				}
			});
		},
	});
	return idMap;
};

export const addEditMark = (code: string) => {
	const ast = toAst(code);
	const transformDataMap = addAttrMark(ast);
	return {
		output: generate(ast, {}, code) || '',
		transformDataMap,
		ast,
	};
};

export const findNodeByUid = (node, uuid, parentKey = []) => {
	let find: any;

	if (isObject(node)) {
		if (node._uuid === uuid) {
			return {
				node,
				path: parentKey,
			};
		}
		// eslint-disable-next-line array-callback-return
		Object.keys(node).some(key => {
			const it = node[key];
			find = findNodeByUid(it, uuid, [...parentKey, key]);
			return find;
		});
	}
	if (isArray(node)) {
		// eslint-disable-next-line array-callback-return
		node.some((it, idx) => {
			if (!find) {
				find = findNodeByUid(it, uuid, [...parentKey, idx]);
				return find;
			}
		});
	}

	return find;
};

export const LowCodeContext = createContext({
	astJson: {},
	dataMap: {},
	onComponentDoubleClick: () => null,
});
