export default {
	data: [
		{
			name: 'Tabs',
			import: 'antd',
			remark: '选项卡组件，用于在不同视图之间切换',
			attribute: [
				{
					name: 'activeKey',
					valueType: 'input',
					remark: '当前激活的选项卡 key',
				},
				{
					name: 'defaultActiveKey',
					valueType: 'input',
					remark: '默认激活的选项卡 key',
				},
				{
					name: 'onChange',
					valueType: 'function',
					remark: '切换选项卡时的回调',
				},
				{
					name: 'tabBarStyle',
					valueType: 'object',
					remark: '自定义选项卡条样式',
				},
				{
					name: 'tabBarGutter',
					valueType: 'input',
					remark: '选项卡之间的间距',
				},
				{
					name: 'type',
					valueType: 'input',
					valueEnum: {
						card: { value: 'card', text: '卡片式选项卡' },
						pill: { value: 'pill', text: '药丸式选项卡' },
					},
					remark: '选项卡类型',
				},
				{
					name: 'size',
					valueType: 'input',
					valueEnum: {
						default: { value: 'default', text: '默认大小' },
						large: { value: 'large', text: '大尺寸' },
						small: { value: 'small', text: '小尺寸' },
					},
					remark: '选项卡大小',
				},
				{
					name: 'tabPosition',
					valueType: 'input',
					valueEnum: {
						top: { value: 'top', text: '顶部' },
						right: { value: 'right', text: '右侧' },
						bottom: { value: 'bottom', text: '底部' },
						left: { value: 'left', text: '左侧' },
					},
					remark: '选项卡位置',
				},
				{
					name: 'tabBarExtraContent',
					valueType: 'input',
					remark: '选项卡条右侧的额外内容',
				},
				{
					name: 'animated',
					valueType: 'bool',
					remark: '是否启用切换动画',
				},
			],
		},
		{
			name: 'Tabs.Panel',
			import: 'antd',
			remark: 'Tabs 的子组件，用于定义每个选项卡的内容',
			attribute: [
				{
					name: 'key',
					valueType: 'input',
					remark: '唯一标识每个面板的 key',
				},
				{
					name: 'tab',
					valueType: 'input',
					remark: '面板的标签，显示在选项卡上',
				},
				{
					name: 'disabled',
					valueType: 'bool',
					remark: '是否禁用该面板',
				},
				{
					name: 'forceRender',
					valueType: 'bool',
					remark: '是否强制渲染该面板内容，即使面板未激活',
				},
			],
		},
	],
};
