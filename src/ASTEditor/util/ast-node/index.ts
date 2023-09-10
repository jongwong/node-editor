import {
	assertJSX,
	assertJSXElement,
	assertJSXOpeningElement,
	assertJSXOpeningFragment,
	assertNode,
	BooleanLiteral,
	booleanLiteral,
	decimalLiteral,
	isBooleanLiteral,
	JSXAttribute,
	jsxAttribute,
	jSXClosingElement,
	jsxElement,
	jsxExpressionContainer,
	jsxIdentifier,
	jsxOpeningElement,
	JSXSpreadAttribute,
	NullLiteral,
	nullLiteral,
	NumericLiteral,
	numericLiteral,
	ObjectExpression,
	objectExpression,
	RegExpLiteral,
	StringLiteral,
	stringLiteral,
} from '@babel/types';
import { isArray, isBoolean, isNumber, isObject, isString } from 'lodash';
import { v4 as uuid } from 'uuid';

type NodeType = any;
export const getJSXElementName = (node: NodeType) => {
	return node?.openingElement?.name?.name;
};
export const getJSXElementAttributesValue = (node: NodeType, name: string) => {
	return node?.openingElement?.attributes?.find(it => it?.name?.name === name)?.value?.value;
};

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
export const getValueLiteral = (val: any) => {
	if (isString(val)) {
		return createJsxAttributeStringNode(val);
	}
	if (isNumber(val)) {
		return numericLiteral(val);
	}
	if (isBoolean(val)) {
		return {
			type: 'JSXExpressionContainer',
			expression: {
				type: 'BooleanLiteral',
				value: val,
			},
		};
	}
	if (val === null) {
		return nullLiteral();
	}
};

export const wrapperJSXElement = (
	name: string,
	children: NodeType[],
	attribute?: Array<JSXAttribute | JSXSpreadAttribute>,
	selfClose = false
) => {
	const curNode = jsxElement(
		jsxOpeningElement(jsxIdentifier(name), attribute || [], selfClose),
		!selfClose ? jSXClosingElement(jsxIdentifier(name)) : null,
		children
	);
	return curNode;
};
export const updateAttribute = (attributes = [], name: string, value) => {
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
	if (!value) {
		return attributes.filter(it => it?.name?.name !== name);
	}
	return attributes;
};

const getLiteralName = node => {
	return node.name.name;
};

export const createNewContainer = (pUid: string) => {
	const firstUuid = uuid();
	const _node = wrapperJSXElement(
		'LowCodeItemContainer',
		[],
		[
			jsxAttribute(jsxIdentifier('_low_code_id'), stringLiteral(firstUuid)),
			jsxAttribute(jsxIdentifier('_parent_uid'), stringLiteral(pUid)),
		],
		true
	);
	_node._low_code_id = firstUuid;
	return _node;
};
export const findNodeByUid = (node, uuid, parentKey = []) => {
	let find: any;

	if (isObject(node)) {
		if (node._low_code_id === uuid) {
			return {
				node,
				pathList: parentKey,
			};
		}
		if (getJSXElementName(node) === 'LowCodeDragItem') {
			const find = node.openingElement?.attributes?.find(it => it?.name?.name === '_low_code_id');
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
