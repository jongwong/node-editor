import * as _React from 'react';

import * as Antd from 'antd';
import * as _lodash from 'lodash';

import LowCodeDragItem from '@/ASTEditor/component/LowCodeDragItem';
import LowCodeItemProxy from '@/ASTEditor/component/LowCodeItemProxy';

const customGlobalRequire = (key: string) => {
	const ob: any = {
		antd: Antd,
		lodash: _lodash,
		react: _React,
		'@yoo/low-code': { LowCodeDragItem, LowCodeItemProxy },
	};

	return ob[key];
};
export default customGlobalRequire;
