import * as _React from 'react';

import * as Antd from 'antd';
import * as _lodash from 'lodash';

import LowCodeDragItem from '@/LowCode/ASTEditor/component/LowCodeDragItem';
import LowCodeItemContainer from '@/LowCode/ASTEditor/component/LowCodeItemContainer';

const customGlobalRequire = (key: string) => {
	const ob: any = {
		antd: Antd,
		lodash: _lodash,
		react: _React,
		'@yoo/low-code': { LowCodeDragItem, LowCodeItemContainer },
	};

	return ob[key];
};
export default customGlobalRequire;
