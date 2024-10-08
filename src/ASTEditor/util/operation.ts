import { forIn, set } from 'lodash';

import { getJSXElementName, getValueLiteral, updateAttribute, updateJexTextNode } from './ast-node';

export const updateAttributeValue = (
	findNode,
	pathString,
	oldAst,
	vals,
	materialAttributeConfig
) => {
	if (!findNode) {
		return;
	}
	forIn(vals, (valueIt, key) => {
		if (materialAttributeConfig && materialAttributeConfig.name === key) {
			const findIndex = findNode?.children?.findIndex(_it => _it?.type === 'JSXText');
			const _newNode = updateJexTextNode(
				findNode?.children[findIndex],
				vals[materialAttributeConfig.name]
			);

			if (findIndex >= 0) {
				findNode.children[findIndex] = _newNode;
			} else {
				findNode.children?.push(_newNode);
			}

			return;
		}
		if (findNode?.openingElement?.attributes) {
			updateAttribute(findNode.openingElement, key, getValueLiteral(valueIt));
		}
		// //
		// findNode?.children?.forEach(childIt => {
		// 	if (getJSXElementName(childIt) === name) {
		// 		childIt.openingElement.attributes = updateAttribute(
		// 			childIt.openingElement.attributes,
		// 			key,
		// 			getValueLiteral(valueIt)
		// 		);
		// 	}
		// });
	});

	set(oldAst, pathString, findNode);
	return oldAst;
};
