import { createContext } from 'react';

import generate from '@babel/generator';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { isJSX, jsxAttribute, jsxIdentifier, stringLiteral } from '@babel/types';
import { forEach, forEachRight, forIn, isArray, isObject, set } from 'lodash';
import prettier, { BuiltInParsers, Options } from 'prettier';
import { v4 as uuid } from 'uuid';

import materialStore from '@/ASTEditor/ASTExplorer/material-store';
import {
	getJSXElementName,
	getValueLiteral,
	updateAttribute,
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
	return generate(ast, {}, code) || '';
};

const addAttrMark = (ast: string) => {
	const idMap = {};
	traverse(ast, {
		enter(path) {
			materialStore.data.forEach(configIt => {
				if (isJSX(path.node, { type: 'JSXElement' })) {
					const name = getJSXElementName(path.node);
					const valid = name === configIt.name;
					if (valid && getJSXElementName(path.parent) !== 'LowCodeDragItem') {
						const _uuid = uuid();
						const ob = {
							uuid: _uuid,
							config: configIt,
							node: path?.node,
							path,
							event: {},
						};
						path.node._uuid = _uuid;
						const attributes = path?.node?.openingElement?.attributes;
						const curNode = wrapperJSXElement('LowCodeDragItem', path.node, [
							...attributes,
							jsxAttribute(jsxIdentifier('lowCodeItemUId'), stringLiteral(_uuid)),
						]);

						path.replaceWith(curNode);

						const updateAttributeValue = (oldAst, vals) => {
							const find = findNodeByUid(oldAst, _uuid);
							if (!find) {
								return;
							}

							forIn(vals, (valueIt, key) => {
								if (find?.node.openingElement?.attributes) {
									find.node.openingElement.attributes = updateAttribute(
										find?.node.openingElement?.attributes,
										key,
										getValueLiteral(valueIt)
									);
								}

								find?.node?.children?.forEach(childIt => {
									if (getJSXElementName(childIt) === configIt.name) {
										childIt.openingElement.attributes = updateAttribute(
											childIt.openingElement.attributes,
											key,
											getValueLiteral(valueIt)
										);
									}
								});
							});
							set(oldAst, find?.pathList, find?.node);
							return oldAst;
						};
						ob.event = { updateAttributeValue };
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

export const removeEditMark = (code: string) => {
	const ast = toAst(code);
	traverse(ast, {
		enter(path) {
			if (getJSXElementName(path.node) === 'LowCodeDragItem') {
				const find = path.node.children?.find(it => {
					return materialStore?.data?.some(configIt => {
						if (isJSX(it, { type: 'JSXElement' })) {
							const name = getJSXElementName(it);
							const valid = name === configIt.name;
							return valid;
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
	return generate(ast, {}, code);
};

export const findNodeByUid = (node, uuid, parentKey = []) => {
	let find: any;

	if (isObject(node)) {
		if (getJSXElementName(node) === 'LowCodeDragItem') {
			const find = node.openingElement?.attributes?.find(it => it?.name?.name === 'lowCodeItemUId');
			if (find?.value?.value === uuid) {
				return {
					node,
					pathList: parentKey,
				};
			}
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
