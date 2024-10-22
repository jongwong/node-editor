import generate from '@babel/generator';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { isJSX, jsxAttribute, jsxIdentifier, stringLiteral } from '@babel/types';
import {
	cloneDeep,
	first,
	forEach,
	forIn,
	isArray,
	isNumber,
	isObject,
	keys,
	last,
	omit,
	set,
} from 'lodash';
import prettier from 'prettier/standalone';
import { v4 as uuid } from 'uuid';

import materialStore from '@/LowCode/ASTEditor/ASTExplorer/material-store';
import {
	createNewContainer,
	ensureProgramAst,
	findAdjacentJSXElements,
	findNodeByUid,
	getAttributeValue,
	getJSXElementName,
	getUUidByNode,
	getValueLiteral,
	logChildren,
	setAttribute,
	updateAttribute,
	updateJexTextNode,
	wrapperJSXElement,
} from '@/LowCode/ASTEditor/utils/ast-node';

const isDebug = false;
const addIdDebug = false;
export const prettierFormat = (code: string) => {
	return prettier.format(code, {
		parser: (text: string, parsers, options) => {
			return toAst(text);
		},
	});
};
export const formattedJson = code => {
	let jsonObject;

	try {
		// 尝试解析 JSON 字符串
		jsonObject = JSON.parse(code);
	} catch (error) {
		throw new Error('Invalid JSON string');
	}

	// 手动使用 JSON.stringify 格式化
	const formattedJson = JSON.stringify(jsonObject, null, 4);
	return formattedJson;
};
export const toAst = (code: string) => {
	const ast = parse(code, { sourceType: 'module', plugins: ['typescript', 'jsx'] });

	return ast;
};

export const generateCode = (ast, code = '') => {
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
		exit(path) {
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

export const resetFlatChildrenItemRemark = node => {
	node.children = reInsertContainer(node);
	const _newAst = ensureProgramAst(node);

	traverse(_newAst, {
		enter: path => {
			const str = path?.parentPath?.getPathLocation();
			if (
				(str === 'body[0]' || /^body\[\d+\]\.children\[(\d+)\]$/.test(str)) &&
				['JSXElement', 'JSXText'].includes(path.node.type)
			) {
				addItemRemark(path, true);
			}
		},
		exit: path => {
			const attributeConfig = {
				_low_code_child_id: '',
				_low_code_parent_id: getUUidByNode(path.parent),
			};
			if (attributeConfig?._low_code_parent_id && isLowCodeElement(path.node)) {
				resetAttributesId(path, attributeConfig);
			}
		},
	});
	return _newAst.body?.[0];
};

const resetAttributesId = (path, attributeConfig) => {
	forEach(attributeConfig, (value, key) => {
		let _val = value;
		if (getJSXElementName(path.node) === 'LowCodeDragItem' && key === '_low_code_child_id') {
			const find = path.node.children.find(it => isItemElement(it));
			const cid = getUUidByNode(find) || '';

			_val = cid;
		}

		if (path.node.openingElement && getAttributeValue(path.node.openingElement, key) === _val) {
			return;
		}

		path.node.openingElement = updateAttribute(path.node.openingElement, key, stringLiteral(_val));
	});
	if (isDebug && path?.node.type === 'JSXElement') {
		path.node._childrenText = logChildren(path.node, true);

		addIdDebug &&
			updateAttribute(
				path.node.openingElement,
				'_low_code_id',
				stringLiteral(path.node._low_code_id)
			);
	}
};

const isItemElement = node => {
	return isFullTextText(node) || isJSX(node, { type: 'JSXElement' });
};

const addItemRemark = (path: any, reset?: boolean) => {
	const isValidText = isFullTextText(path.node);
	if (!isItemElement(path.node)) {
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

	const isMaterialJsx =
		isValidText ||
		materialStore.data.some(configIt => {
			return name === configIt.name;
		});

	const attributeConfig = {
		_low_code_child_id: cUid,
		_low_code_parent_id: pUid,
		_low_code_type: isValidText ? 'JSXText' : 'JSXElement',
	};

	if (
		getJSXElementName(path.node) === 'LowCodeDragItem' ||
		getJSXElementName(path.node) === 'LowCodeItemContainer'
	) {
		resetAttributesId(path, omit(attributeConfig));
		return;
	}

	if (!isMaterialJsx) {
		return;
	}

	if (getJSXElementName(path.parent) !== 'LowCodeDragItem') {
		const _uid = uuid();
		if (isDebug && path?.node?.type === 'JSXElement') {
			addIdDebug && updateAttribute(path.node.openingElement, '_low_code_id', stringLiteral(_uid));
		}
		const _node = path.node;

		const lowCodeDragItem = wrapperJSXElement(
			'LowCodeDragItem',
			[_node],
			[jsxAttribute(jsxIdentifier('_low_code_id'), stringLiteral(_uid))]
		);
		if (isDebug) {
			lowCodeDragItem._childrenText = logChildren(lowCodeDragItem, true);
		}

		forEach(attributeConfig, (value, key) => {
			lowCodeDragItem.openingElement = updateAttribute(
				lowCodeDragItem.openingElement,
				key,
				stringLiteral(value)
			);
		});

		lowCodeDragItem._low_code_id = _uid;

		path.replaceWith(lowCodeDragItem);
	}
};

export const addAttrMarkByAst = ast => {
	traverse(ast, {
		enter(path) {
			addItemRemark(path);
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
	const _node = cloneDeep(ast);
	traverse(_node, {
		enter(path) {
			if (isLowCodeContainer(path.node)) {
				path.remove();
			} else if (isLowCodeDragItem(path.node)) {
				const childId = getAttributeValue(path.node, '_low_code_child_id');
				const find = path.node?.children?.find(it => getUUidByNode(it) === childId);
				if (find) {
					path.replaceWith(find);
				} else {
					path.remove();
				}
			}
		},
	});
	return _node;
};

export const removeEditMark = (code: string | Record<string, any>) => {
	const ast = toAst(code);
	removeEditMarkAst(ast);
	return generate(ast, {}, code);
};

const appendIndexPath = (parentPathString: string, idx: number) => {
	return parentPathString + '[' + idx + '}';
};
export const isLowCodeElement = node => {
	return ['LowCodeDragItem', 'LowCodeItemContainer'].includes(getJSXElementName(node));
};

export const isLowCodeDragItem = node => {
	return ['LowCodeDragItem'].includes(getJSXElementName(node));
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
	const name = getJSXElementName(node);
	const find = (window.materialStore?.data || []).find(it => it.name === name);

	const _rawChildren = node?.children || [];
	const hasChild = find && !find?.attribute.some(it => it.name === 'children');

	if (!hasChild && _rawChildren?.length === 0) {
		return _rawChildren;
	}
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
