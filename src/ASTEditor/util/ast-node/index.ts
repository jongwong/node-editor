import traverse from '@babel/traverse';
import {
	JSXAttribute,
	jsxAttribute,
	jSXClosingElement,
	jsxElement,
	jsxIdentifier,
	jsxOpeningElement,
	JSXSpreadAttribute,
	jsxText,
	nullLiteral,
	numericLiteral,
	stringLiteral,
} from '@babel/types';
import { cloneDeep, isArray, isBoolean, isNumber, isObject, isString, set } from 'lodash';
import { v4 as uuid } from 'uuid';

import {
	generateCode,
	isLowCodeElement,
	prettierFormat,
	removeEditMarkAst,
} from '@/ASTEditor/util';

type NodeType = any;
export const getJSXElementName = (node: NodeType) => {
	return node?.openingElement?.name?.name;
};

export const renderNodeName = (node: NodeType) => {
	if (node?.type === 'JSXText') {
		return 'Text';
	}
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
export const updateAttribute = (node, name: string, value) => {
	const attributes = node?.attributes || [];

	const idx = attributes.findIndex(nodeAttrIt => nodeAttrIt?.name?.name === name);

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
	node.attributes = attributes;

	return node;
};

const getLiteralName = node => {
	return node.name.name;
};

export const createNewContainer = (pUid: string, cUid: string) => {
	const _node = wrapperJSXElement(
		'LowCodeItemContainer',
		[],
		[
			jsxAttribute(jsxIdentifier('_low_code_parent_id'), stringLiteral(pUid)),
			jsxAttribute(jsxIdentifier('_low_code_id'), stringLiteral(cUid)),
		],
		true
	);
	_node._low_code_id = cUid;
	return _node;
};
export const findNodeByUid = (node, uuid) => {
	let find: any;

	traverse(node, {
		enter: path => {
			if (uuid && getUUidByNode(path.node) === uuid) {
				find = path.getPathLocation();
			}
		},
	});
	return find;
};

export const updateJexTextNode = (node, val: string) => {
	if (!node) {
		return jsxText(val);
	}

	node.value = val;
	node.extra.value = val;
	const raw = node.extra.raw;
	node.extra.raw = raw[0] + val + raw[raw.lenght - 1];
	return node;
};

export const findAdjacentJSXElements = (index: number, siblings: any) => {
	let prevIndex = index;
	let nextIndex = index;

	// 查找前一个相邻的 JSXElement
	while (prevIndex > 0 && siblings[prevIndex - 1].type !== 'JSXElement') {
		prevIndex--;
	}
	if (prevIndex > 0) {
		prevIndex--; // 返回到上一个 JSXElement 的索引
	}

	// 查找后一个相邻的 JSXElement
	while (nextIndex < siblings.length - 1 && siblings[nextIndex + 1].type !== 'JSXElement') {
		nextIndex++;
	}
	if (nextIndex < siblings.length - 1) {
		nextIndex++; // 返回到下一个 JSXElement 的索引
	}

	return {
		preIndex: prevIndex < 0 ? 0 : prevIndex,
		nextIndex: nextIndex >= siblings.length ? siblings.length : nextIndex,
	};
};
export const setAttribute = (node, attributeName, attributeValue) => {
	// 创建一个新的节点，复制原有节点的属性
	const newNode = {
		...node,
		attributes: node.attributes ? [...node.attributes] : [], // 确保属性存在
	};

	// 查找现有属性
	const existingAttributeIndex = newNode.attributes.findIndex(
		attr => attr.name.name === attributeName
	);

	if (existingAttributeIndex !== -1) {
		// 如果属性存在，更新其值
		newNode.attributes[existingAttributeIndex].value = {
			type: 'StringLiteral', // 根据需要调整类型
			value: attributeValue,
		};
	} else {
		// 如果属性不存在，添加新属性
		newNode.attributes.push({
			type: 'JSXAttribute',
			name: {
				type: 'JSXIdentifier',
				name: attributeName,
			},
			value: {
				type: 'StringLiteral', // 根据需要调整类型
				value: attributeValue,
			},
		});
	}

	return newNode; // 返回新的节点
};
export const getAttributeValue = (node, attributeName) => {
	if (node?.attributes) {
		const attribute = node.attributes.find(attr => attr.name.name === attributeName);
		if (attribute && attribute.value && attribute.value.type === 'StringLiteral') {
			return attribute.value.value; // 返回属性值
		}
	}
	return ''; // 如果属性不存在，返回空字符串
};
export const getJsxNameAndImport = (node, ast) => {
	if (node.type === 'JSXElement') {
		const name = node.openingElement.name;

		// 获取组件名称
		const componentName = name.type === 'JSXIdentifier' ? name.name : name.name.name;

		// 查找所有 ImportDeclaration
		const imports = ast.program.body.filter(statement => statement.type === 'ImportDeclaration');

		// 首先检查直接导入
		const importEntry = imports.find(entry =>
			entry.specifiers.some(spec => {
				if (spec.type === 'ImportSpecifier' && spec.local.name === componentName) {
					return true;
				}
				// 处理 { Item } = Form 的情况
				if (spec.type === 'ImportDefaultSpecifier' && spec.local.name === componentName) {
					return true;
				}
				return false;
			})
		);

		if (importEntry) {
			return {
				name: componentName,
				import: importEntry.source.value, // 返回从语句的源路径
			};
		}

		// 如果没有直接的 Import, 检查变量声明
		const variableDeclarations = ast.program.body.filter(
			statement => statement.type === 'VariableDeclaration'
		);

		for (const declaration of variableDeclarations) {
			for (const decl of declaration.declarations) {
				if (decl.init && decl.init.type === 'MemberExpression') {
					const { object, property } = decl.init;
					if (property.name === componentName) {
						const relatedImport = imports.find(entry =>
							entry.specifiers.some(spec => spec.local.name === object.name)
						);
						if (relatedImport) {
							return {
								name: componentName,
								import: relatedImport.source.value, // 相关导入路径
							};
						}
					}
				}
			}
		}

		// 处理结构赋值的情况
		const assignments = variableDeclarations.find(statement =>
			statement.declarations.some(
				decl =>
					decl.id.type === 'ObjectPattern' &&
					decl.id.properties.some(prop => prop.key.name === componentName)
			)
		);

		if (assignments) {
			const assignedName = assignments.declarations[0].init.name; // 赋值的对象名
			const relatedImport = imports.find(entry =>
				entry.specifiers.some(spec => spec.local.name === assignedName)
			);
			if (relatedImport) {
				return {
					name: componentName,
					import: relatedImport.source.value, // 相关导入路径
				};
			}
		}
	}

	return null; // 如果不是 JSXElement，返回 null
};
export const getUUidByNode = node => {
	return node?._low_code_id;
};

export const getIndexByParent = (targetParentNode: any, targetNode: any) => {
	return targetParentNode?.children?.findIndex(
		it => getUUidByNode(it) === getUUidByNode(targetNode)
	);
};

export const logChildren = (node: any, removeRemark?: boolean) => {
	const _newNode = cloneDeep(node);
	traverse(removeRemark ? ensureProgramAst(removeEditMarkAst(_newNode)) : ensureProgramAst(node), {
		exit: path => {
			if (isLowCodeElement(path.node)) {
				path.node.openingElement.attributes = [];
				set(_newNode, path.getPathLocation(), path.node);
			}
		},
	});

	const re = generateCode(_newNode, '');
	return prettierFormat(re.code);
};

export const logAstJsxIndex = (ast: any, name: string, index = 0, removeRemark?: boolean) => {
	const cloneAst = cloneDeep(ast);
	let idx = 0;
	let re = '';
	traverse(removeRemark ? removeEditMarkAst(cloneAst) : ensureProgramAst(cloneAst), {
		exit: path => {
			if (getJSXElementName(path.node) === name) {
				if (idx === index) {
					re = logChildren(path.node);
					path.stop();
				}
				idx = idx + 1;
			}
		},
	});
	return re;
};

export const ensureProgramAst = (ast: any) => {
	if (ast.type === 'Program') {
		return ast; // 如果已经是 Program，直接返回
	}

	// 否则，我们将其包裹在 Program 中
	return {
		type: 'Program',
		body: [ast], // 把原来的 AST 放在 body 数组中
		sourceType: 'module', // 可以根据需要设置为 'module' 或 'script'
	};
};
// 更新并返回新的 JSXText 节点
export const updateJSXTextNode = (jsxTextNode: any, newText: string): any => {
	// 返回一个新的节点，更新了 jsxText
	return {
		...jsxTextNode, // 保持原节点的其他属性
		value: newText, // 更新新的文本
	};
};
