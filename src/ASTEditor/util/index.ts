import { createContext } from 'react';

import generate from '@babel/generator';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { isJSX, jsxAttribute, jsxIdentifier, stringLiteral } from '@babel/types';
import { first, forIn, isArray, isNumber, isObject, keys, last, set } from 'lodash';
import prettier, { BuiltInParsers, Options } from 'prettier';
import { v4 as uuid } from 'uuid';

import materialStore from '@/ASTEditor/ASTExplorer/material-store';
import {
	createNewContainer,
	findAdjacentJSXElements,
	findNodeByUid,
	getAttributeValue,
	getJSXElementName,
	getUUidByNode,
	getValueLiteral,
	setAttribute,
	updateAttribute,
	updateJexTextNode,
	wrapperJSXElement,
} from '@/ASTEditor/util/ast-node';

const isDebug = true;

export const prettierFormat = (code: string) => {
	return prettier.format(code, {
		parser: (text: string, parsers: BuiltInParsers, options: Options) => {
			return toAst(text);
		},
	});
};

export const toAst = (code: string) => {
	const ast = parse(code, { sourceType: 'module', plugins: ['typescript', 'jsx'] });

	return ast;
};

export const generateCode = (ast, code) => {
	return (
		generate(
			ast,
			{ retainLines: true, retainFunctionParens: true, comments: true, compact: false },
			code
		) || ''
	);
};

export const getNodeUIDPathMap = ast => {
	const ob = {};
	traverse(ast, {
		enter(path) {
			const id = getUUidByNode(path.node);
			if (id) {
				ob[id] = {
					pathKey: path.getPathLocation(),
					path: path,
					name: getJSXElementName(path.node),
				};
			}
		},
	});
	return ob;
};

export const addAttrMarkByAst = ast => {
	traverse(ast, {
		enter(path) {
			if (!isJSX(path.node, { type: 'JSXElement' })) {
				return;
			}

			const name = getJSXElementName(path.node);

			if (!path.node._low_code_id) {
				path.node._low_code_id = uuid();
			}
			if (!path.parent._low_code_id) {
				path.parent._low_code_id = uuid();
			}
			const cUid = path.node._low_code_id;
			const pUid = path.parent._low_code_id;
			const isMaterialJsx = materialStore.data.some(configIt => {
				return name === configIt.name;
			});

			if (!isMaterialJsx) {
				return;
			}
			if (
				getJSXElementName(path.node) === 'LowCodeDragItem' ||
				getJSXElementName(path.node) === 'LowCodeItemContainer'
			) {
				// const isError =
				// 	getUUidByNode(path.node?.children[0]) !==
				// 	getAttributeValue(path.node, '_low_code_child_id');
				// if (isError) {
				// 	path.remove();
				// }
				return;
			}

			if (getJSXElementName(path.parent) !== 'LowCodeDragItem') {
				const _uid = uuid();

				const _node = isDebug
					? updateAttribute(path?.node, '_low_code_id', stringLiteral(_uid))
					: path.node;

				const lowCodeDragItem = wrapperJSXElement(
					'LowCodeDragItem',
					[_node],
					[
						jsxAttribute(jsxIdentifier('_low_code_id'), stringLiteral(_uid)),
						jsxAttribute(jsxIdentifier('_low_code_child_id'), stringLiteral(cUid)),
						jsxAttribute(jsxIdentifier('_low_code_parent_id'), stringLiteral(pUid)),
					]
				);
				lowCodeDragItem._low_code_id = _uid;

				path.replaceWith(lowCodeDragItem);
			}
		},
		exit(path) {
			if (path.node.type === 'JSXElement' && !isLowCodeElement(path.node)) {
				path.node.children = reInsertContainer(path.node); // 更新子节点
			}
		},
	});
	return ast;
};

export const addEditMark = (code: string) => {
	const ast = toAst(code);
	addAttrMarkByAst(ast);
	return {
		outputCode: prettierFormat(generate(ast, {}, code).code || ''),
		ast,
	};
};

export const removeEditMarkAst = (ast: any) => {
	traverse(ast, {
		enter(path) {
			if (isLowCodeElement(path.node)) {
				const find = path.node.children?.find(it => {
					return materialStore?.data?.some(configIt => {
						if (isJSX(it, { type: 'JSXElement' })) {
							const name = getJSXElementName(it);
							return name === configIt.name;
						}
					});
				});

				if (find) {
					path.replaceWith(find);
				} else {
					path.remove();
				}
			}
		},
	});
	return ast;
};

export const removeEditMark = (code: string | Record<string, any>) => {
	const ast = toAst(code);
	removeEditMarkAst(ast);
	return generate(ast, {}, code);
};

const appendIndexPath = (parentPathString: string, idx: number) => {
	return parentPathString + '[' + idx + '}';
};
const isLowCodeElement = node => {
	return ['LowCodeDragItem', 'LowCodeItemContainer'].includes(getJSXElementName(node));
};
const isLowCodeContainer = node => {
	return getJSXElementName(node) === 'LowCodeItemContainer';
};
const isEmptyTextText = _node => {
	return _node && _node?.type === 'JSXText' && !_node?.value?.trim();
};
const isFullTextText = _node => {
	return _node && _node?.type === 'JSXText' && _node?.value?.trim();
};

export const reInsertContainer = node => {
	const _rawChildren = node?.children || [];

	const repeatIndexList: number[] = _rawChildren
		.map((it, idx) => {
			if (isLowCodeContainer(it) && isLowCodeContainer(_rawChildren[idx + 1])) {
				return idx + 1;
			}

			return -1;
		})
		.filter(it => it >= 0);
	const children = _rawChildren.filter((it, idx) => !repeatIndexList.includes(idx));
	const newChildren: any[] = [];

	const containerIndexMap: any = {};
	const JsxIndexMap: any = {};
	const otherIndexMap: any = {};
	const isValidJsx = _node => {
		return _node?.type === 'JSXElement' || isFullTextText(_node);
	};
	children.forEach((item, idx) => {
		if (isLowCodeContainer(item)) {
			containerIndexMap[idx] = item;
		} else if (isValidJsx(item)) {
			JsxIndexMap[idx] = item;
		} else {
			otherIndexMap[idx] = item;
		}
	});
	let isContainer = true;

	let curRawIndex = 0;
	let containerIndex = -1;
	// JsxIndexMap的长度 + container的长度(比JsxIndexMap多一个) + 其他的
	const len = keys(JsxIndexMap).length * 2 + 1 + keys(otherIndexMap).length;
	for (let i = 0; i < len; i++) {
		if (isContainer) {
			const _node = containerIndexMap[i] || createNewContainer(getUUidByNode(node), uuid());
			if (containerIndexMap[curRawIndex]) {
				curRawIndex = curRawIndex + 1;
			}
			if (containerIndex >= 0) {
				newChildren.splice(containerIndex, 0, _node);
			} else {
				newChildren.push(_node);
			}

			containerIndex = -1;
			isContainer = false;
		} else {
			const find = JsxIndexMap[curRawIndex] || otherIndexMap[curRawIndex];
			if (find) {
				newChildren.push(find);
			}
			curRawIndex = curRawIndex + 1;
			if (isValidJsx(find) || curRawIndex === children.length - 1) {
				isContainer = true;
			} else {
				if (!isNumber(containerIndex)) {
					containerIndex = i - 1;
				}
			}
			if (curRawIndex === children.length - 1) {
				containerIndex = -1;
			}
		}
	}
	return newChildren;
};
