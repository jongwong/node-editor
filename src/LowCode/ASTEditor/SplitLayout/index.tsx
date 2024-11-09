import React, { useState } from 'react';
import SplitPane from 'react-split-pane';

import { MinusOutlined } from '@ant-design/icons';
import { first } from 'lodash';
import { TabsProps } from 'rc-tabs';

import Tabs from '@/components/Tabs';

import './index.less';

type SplitLayoutProps = {
	bottomTabsItems: TabsProps['items'];
	leftTabsItems: TabsProps['items'];
	rightTabsItems: TabsProps['items'];
	children: React.ReactNode;
};
const leftPanelWidth = 250;
const bottomPanelWidth = 250;
const rightPanelWidth = 400;
const SplitLayout: React.FC<SplitLayoutProps> = props => {
	const { bottomTabsItems, leftTabsItems, rightTabsItems, children, ...rest } = props;
	const [bottomActiveKey, setBottomActiveKey] = useState<string | null>(null);
	const [bottomSize, setBottomSize] = useState(24);
	const [leftActiveKey, setLeftActiveKey] = useState<string | null>(
		first(leftTabsItems)?.key as any
	);
	const [leftSize, setLeftSize] = useState(leftPanelWidth);
	const [rightActiveKey, setRightActiveKey] = useState<string | null>(
		first(rightTabsItems)?.key as any
	);
	const [rightSize, setRightSize] = useState(rightPanelWidth);

	const renderCloseIcon = (cb: () => void) => {
		return (
			<span style={{ padding: '2px 8px' }}>
				<MinusOutlined
					onClick={e => {
						cb();
					}}
				/>
			</span>
		);
	};

	const splitCommonConfig = {
		onDragStarted: () => {
			const el = document.querySelector('.main-panel');
			if (el) {
				el.classList.add('disabled-pointer-events'); // 添加禁用样式
			}
		},
		onDragFinished: () => {
			const el = document.querySelector('.main-panel');
			if (el) {
				el.classList.remove('disabled-pointer-events'); // 移除禁用样式
			}
		},
	};

	return (
		<SplitPane
			split="horizontal"
			className={'w-1-1'}
			size={bottomActiveKey ? bottomSize : 24}
			onChange={setBottomSize}
			primary="second"
			minSize={24}
			{...splitCommonConfig}
		>
			<SplitPane
				split="vertical"
				{...splitCommonConfig}
				size={leftActiveKey ? leftSize : 24}
				onChange={e => {
					setLeftSize(e);
				}}
				className={'w-1-1 h-1-1'}
			>
				<Tabs
					direction={'rtl'}
					className={'h-1-1'}
					items={leftTabsItems.map(it => ({
						...it,
						children: (
							<div className={'w-1-1 h-1-1'}>
								<div style={{ height: 24 }}></div> {it.children}
							</div>
						),
					}))}
					activeKey={leftActiveKey}
					onTabClick={e => {
						if (e === leftActiveKey) {
							setLeftActiveKey(null);
						} else {
							if (leftSize === 24) {
								setLeftSize(leftPanelWidth);
							}

							setLeftActiveKey(e);
						}
					}}
					tabPosition={'right'}
				/>
				<SplitPane
					{...splitCommonConfig}
					split="vertical"
					primary="second"
					size={rightActiveKey ? rightSize : 24}
					onChange={e => {
						setRightSize(e);
					}}
					className={'w-1-1 h-1-1'}
				>
					{children}
					<Tabs
						destroyInactiveTabPane
						className={'h-1-1'}
						direction={'ltr'}
						items={rightTabsItems}
						tabPosition={'left'}
						activeKey={rightActiveKey}
						onTabClick={e => {
							if (e === rightActiveKey) {
								setRightActiveKey(null);
							} else {
								if (leftSize === 24) {
									setRightSize(rightPanelWidth);
								}

								setRightActiveKey(e);
							}
						}}
					></Tabs>
				</SplitPane>
			</SplitPane>

			<Tabs
				destroyInactiveTabPane
				tabBarExtraContent={
					bottomActiveKey
						? renderCloseIcon(() => {
								setBottomActiveKey(null);
						  })
						: null
				}
				className={'h-1-1 w-1-1'}
				items={bottomTabsItems}
				activeKey={bottomActiveKey}
				onTabClick={e => {
					if (e === bottomActiveKey) {
						setBottomActiveKey(null);
					} else {
						if (bottomSize === 24) {
							setBottomSize(bottomPanelWidth);
						}

						setBottomActiveKey(e);
					}
				}}
			/>
		</SplitPane>
	);
};
export default SplitLayout;
