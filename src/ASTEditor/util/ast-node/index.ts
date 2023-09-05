import template from '@babel/template';
import {
	assertJSX,
	assertJSXElement,
	assertJSXOpeningElement,
	assertJSXOpeningFragment,
	assertNode,
	JSXAttribute,
	jSXClosingElement,
	jsxElement,
	jsxExpressionContainer,
	jsxIdentifier,
	jsxOpeningElement,
	JSXSpreadAttribute,
	ObjectExpression,
	objectExpression,
} from '@babel/types';

type NodeType = any;
export const getJSXElementName = (node: NodeType) => {
	return node?.openingElement?.name?.name;
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
	console.log('======curNode====>', curNode);
	return curNode;
};
