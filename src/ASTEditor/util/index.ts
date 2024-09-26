import { createContext } from 'react';

import generate from '@babel/generator';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { isJSX, jsxAttribute, jsxIdentifier, stringLiteral } from '@babel/types';
import { forIn, isArray, isObject, set } from 'lodash';
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
					path: path.getPathLocation(),
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
				const lowCodeDragItem = wrapperJSXElement(
					'LowCodeDragItem',
					[path.node],
					[
						jsxAttribute(jsxIdentifier('_low_code_id'), stringLiteral(_uid)),
						jsxAttribute(jsxIdentifier('_low_code_child_id'), stringLiteral(cUid)),
					]
				);
				lowCodeDragItem._low_code_id = _uid;

				path.replaceWith(lowCodeDragItem);
			}
		},
		exit(path) {
			if (path.node.type === 'JSXElement' && getJSXElementName(path.node) === 'LowCodeDragItem') {
				const siblings = path.parent?.children || [];
				const index = siblings.indexOf(path.node);
				const pId = getUUidByNode(path.parent);

				const { preIndex, nextIndex } = findAdjacentJSXElements(index, siblings);
				if (getJSXElementName(siblings[preIndex]) !== 'LowCodeItemContainer') {
					const lowCodeItemContainer = createNewContainer(pId, uuid());
					siblings.splice(preIndex, 0, lowCodeItemContainer); // 插入到当前 LowCodeDragItem 前
				}

				if (
					nextIndex !== preIndex &&
					getJSXElementName(siblings[nextIndex]) !== 'LowCodeItemContainer'
				) {
					const lowCodeItemContainer = createNewContainer(pId, uuid());
					siblings.splice(nextIndex, 0, lowCodeItemContainer); // 插入到当前 LowCodeDragItem 后
				}
			}

			if (path.node.type === 'JSXElement' && !isLowCodeElement(path.node)) {
				const find = path.node?.children?.some(it => it.type === 'JSXElement');
				if (!find) {
					const lowCodeItemContainer = createNewContainer(getUUidByNode(path.node), uuid());
					path.node?.children.push(lowCodeItemContainer);
				}
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
