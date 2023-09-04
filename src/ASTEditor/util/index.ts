import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import generate from '@babel/generator';
import {
	isIdentifier,
	isImportDeclaration,
	isImportOrExportDeclaration,
	isJSX,
	isJSXAttribute,
	isModuleSpecifier,
	jsxAttribute,
	Node,
} from '@babel/types';
import { forEach, forEachRight, forIn, isArray, isObject, set } from 'lodash';
import { v4 as uuid } from 'uuid';

import materialStore from '@/ASTEditor/ASTExplorer/material-store';
import { findParentNode, isHoverTarget } from '@/ASTEditor/util/dom';

export const toAst = (code: string) => {
	const ast = parse(code, { sourceType: 'module', plugins: ['typescript', 'jsx'] });

	return ast;
};

const getModuleSpecifierModuleName = (curPath: any) => curPath?.parentPath.node.source.value;

export const generateCode = (ast, code) => {
	return generate(ast, {}, code) || '';
};

const addAttrMark = (ast: string) => {
	const idMap = {};
	traverse(ast, {
		enter(path) {
			materialStore.data.forEach(it => {
				if (isJSX(path.node, { type: 'JSXOpeningElement' })) {
					const { valid, markType } = it?.condition?.(path) || {};
					if (valid) {
						let { attributes } = path.node;

						const ob = {
							uuid: uuid(),
							materialData: it,
							attributeValueMap: {},
						};
						path.node._uuid = ob.uuid;
						attributes = updateAttribute(attributes, 'low-code-uuid', {
							type: 'StringLiteral',
							value: ob.uuid,
						});
						attributes = updateAttribute(attributes, 'low-code-type', {
							type: 'StringLiteral',
							value: 'ListItem',
						});

						path.node.attributes = attributes;

						it?.attribute?.forEach(childIt => {
							ob.attributeValueMap[childIt.name] = {
								getValue: () => {
									const find = path.node.attributes.find(
										attrIt => getAttributeName(attrIt) === childIt.name
									);
									return find ? getAttributeValue(find) : undefined;
								},
								updateValue: (oldAst, val) => {
									const findP = findNodeByUid(oldAst, ob.uuid);
									const map = {
										input: createJsxAttributeStringNode,
										bool: createJsxAttributeBoolNode,
									};
									if (!findP) {
										return;
									}
									let newVal = updateAttribute(
										findP.node.attributes,
										childIt.name,
										map[childIt.valueType](val)
									);
									if (val === undefined) {
										newVal = newVal.filter(attrIt => getAttributeName(attrIt) !== childIt.name);
									}
									findP.node.attributes = newVal;
									set(oldAst, findP.path, findP.node);
								},
							};
						});

						idMap[ob.uuid] = ob;
					}
				}
			});
		},
	});
	return {
		idMap,
	};
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

const updateAttribute = (attributes = [], name: string, value) => {
	const idx = attributes.findIndex(nodeAttrIt => nodeAttrIt.name.name === name);

	const _ast = jsxAttribute(
		{
			type: 'JSXIdentifier',
			name,
		},
		value
	);
	if (idx >= 0) {
		attributes[idx] = _ast;
	} else {
		attributes.push(_ast);
	}
	return attributes;
};

const getAttributeName = node => {
	return node.name.name;
};
const getValue = node => {
	if (node.type === 'JSXExpressionContainer') {
		return getValue(node.expression);
	}
	if (node.type === 'BooleanLiteral' || node.type === 'StringLiteral') {
		return node.value;
	}
};
const getAttributeValue = node => {
	return getValue(node.value);
};
const updateAttributeValue = (node, val) => {
	const oldVal = node.value.value;
	node.value.extra.raw = node.value.extra.raw.replace(oldVal, val);
	node.value.extra.rawValue = node.value.extra.rawValue.replace(oldVal, val);
	node.value.value = val;
	return node;
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

const createJsxAttributeBoolNode = (val: boolean) => ({
	type: 'JSXExpressionContainer',
	expression: {
		type: 'BooleanLiteral',
		value: val,
	},
});
const createJsxAttributeStringNode = (val: string) => {
	const jsStr = JSON.stringify({
		type: 'StringLiteral',
		extra: {
			rawValue: 'XX',
			raw: '"XX"',
		},
		value: 'XX',
	});
	const ob = JSON.parse(jsStr.replace(/XX/g, val));
	return ob;
};
