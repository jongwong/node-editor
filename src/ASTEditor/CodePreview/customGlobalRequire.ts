import * as _React from 'react';

import * as Antd from 'antd';
import * as _lodash from 'lodash';

const customGlobalRequire = (key: string) => {
	const ob: any = {
		antd: Antd,
		lodash: _lodash,
		react: _React,
	};

	return ob[key];
};
export default customGlobalRequire;
