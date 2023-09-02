import React, { useEffect } from 'react';

import { code1 } from '@/ASTEditor/code';
import { toAst } from '@/ASTEditor/util';

const ASTEditor: React.FC = props => {
	const { ...rest } = props;
	useEffect(() => {
		toAst(code1);
	}, []);
	return <div>ASTEditor</div>;
};
export default ASTEditor;
