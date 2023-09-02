import { parse } from '@babel/parser';
/* eslint-disable */
export const toAst = (code: string) => {
	return parse(code, { sourceType: 'module' });
};
