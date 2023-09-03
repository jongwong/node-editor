import generate from '@babel/generator';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import {
	isIdentifier,
	isImportDeclaration,
	isImportOrExportDeclaration,
	isJSX,
	isModuleSpecifier,
	Node,
} from '@babel/types';

const MaterialStore = {
	data: [
		{
			name: 'Form',
			import: 'antd',
		},
		{
			name: 'Item',
		},
	],
};
export const toAst = (code: string) => {
	const ast = parse(code, { sourceType: 'module', plugins: ['typescript', 'jsx'] });

	return ast;
};

const getModuleSpecifierModuleName = (curPath: any) => curPath?.parentPath.node.source.value;

export const transformCode1 = (code: string) => {
	const ast = toAst(code);

	traverse(ast, {
		enter(curPath) {
			if (isModuleSpecifier(curPath.node)) {
				const name = getModuleSpecifierModuleName(curPath);
			}
			if (isJSX(curPath.node, { type: 'JSXAttribute' }) && curPath.node?.name?.name === 'label') {
				// eslint-disable-next-line no-param-reassign
				curPath.node.value.value = 'name1';
			}
		},
	});
	return generate(ast, {}, code) || '';
};
