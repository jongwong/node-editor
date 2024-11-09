import React from 'react';

import RCTabs, { TabsProps as RCTabsProps } from 'rc-tabs';

import './index.less';

type TabsProps = RCTabsProps;
const Tabs: React.FC<TabsProps> = props => {
	const { ...rest } = props;
	return <RCTabs prefixCls={'yo-tabs'} {...rest} />;
};
export default Tabs;
