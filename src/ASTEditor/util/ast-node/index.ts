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
import { isBoolean, isNumber, isString } from 'lodash';

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
	node: NodeType,
	attribute?: Array<JSXAttribute | JSXSpreadAttribute>
) => {
	const curNode = jsxElement(
		jsxOpeningElement(jsxIdentifier(name), attribute || [], false),
		jSXClosingElement(jsxIdentifier(name)),
		[node],
		false
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
