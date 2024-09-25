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
	findNodeByUid,
	getJSXElementName,
	getValueLiteral,
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

const addAttrMark = (ast: any) => {
	const idMap = {};
	const hasInsertMap = {};
	traverse(ast, {
		enter(path) {
			if (!path.node._low_code_id) {
				path.node._low_code_id = uuid();
			}
			if (!path.parent._low_code_id) {
				path.parent._low_code_id = uuid();
			}
			const name = getJSXElementName(path.node);
			const _low_code_id = path.node._low_code_id;

			materialStore.data.forEach(configIt => {
				if (isJSX(path.node, { type: 'JSXElement' })) {
					const curNodeUid = _low_code_id;
					const valid = name === configIt.name;
					if (valid && getJSXElementName(path.parent) !== 'LowCodeDragItem') {
						const ob = {
							uuid: uuid(),
							name: getJSXElementName(path.node),
							node: path?.node,
							path,
							event: {},
						};
						ob.config = configIt;
						const curNode = wrapperJSXElement(
							'LowCodeDragItem',
							[path.node],
							[
								jsxAttribute(jsxIdentifier('_low_code_name'), stringLiteral('LowCodeDragItem')),
								jsxAttribute(jsxIdentifier('_low_code_id'), stringLiteral(ob.uuid)),
								jsxAttribute(jsxIdentifier('_low_code_child_id'), stringLiteral(curNodeUid)),
							]
						);

						path.replaceWith(curNode);

						const updateAttributeValue = (oldAst, vals, childrenConfig) => {
							const find = findNodeByUid(oldAst, curNodeUid);
							if (!find) {
								return;
							}

							forIn(vals, (valueIt, key) => {
								if (childrenConfig && childrenConfig.name === key) {
									const findIndex = find.node?.children?.findIndex(_it => _it?.type === 'JSXText');
									const _newNode = updateJexTextNode(
										find.node?.children[findIndex],
										vals[childrenConfig.name]
									);

									if (findIndex >= 0) {
										find.node.children[findIndex] = _newNode;
									} else {
										find.node.children?.push(_newNode);
									}

									return;
								}
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

			idMap[_low_code_id] = {
				uuid: _low_code_id,
				name: getJSXElementName(path.node),
				node: path?.node,
				path,
				event: {},
			};
		},
		exit(path) {
			const pUid = path.parent._low_code_id;
			const hasDone = hasInsertMap[pUid];
			const isEl = ['JSXText', 'JSXElement'].includes(path.node.type);
			if (!isEl || hasDone) {
				return;
			}
			hasInsertMap[pUid] = true;

			if (
				path?.parent?.type === 'JSXElement' &&
				getJSXElementName(path.parent) !== 'LowCodeDragItem'
			) {
				const children: any[] = [createNewContainer(pUid)];
				path?.parent?.children?.forEach((it, idx) => {
					if (getJSXElementName(it) === 'LowCodeItemContainer') {
						return;
					} else if (it.type === 'JSXText') {
						children.push(it);
						if (idx === path.parent.children.length - 1) {
							//children.push(createNewContainer());
						}
					} else {
						children.push(it);
						children.push(createNewContainer(pUid));
					}
				});
				path.parent.children = children;
			}
		},
	});
	return idMap;
};

export const addEditMark = (code: string) => {
	const ast = toAst(code);
	const transformDataMap = addAttrMark(ast);
	return {
		outputCode: prettierFormat(generate(ast, {}, code).code || ''),
		transformDataMap,
		ast,
	};
};

export const removeEditMarkAst = (ast: any) => {
	traverse(ast, {
		enter(path) {
			if (
				getJSXElementName(path.node) === 'LowCodeDragItem' ||
				getJSXElementName(path.node) === 'LowCodeItemContainer'
			) {
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
