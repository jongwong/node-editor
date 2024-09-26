export default {
	data: [
		{
			name: 'Table',
			import: 'antd',
			remark: '用于展示数据的表格组件',
			attribute: [
				{
					name: 'dataSource',
					valueType: 'array',
					remark: '表格数据源，每项为一行数据',
				},
				{
					name: 'columns',
					valueType: 'array',
					remark: '表格列配置，包括列的标题、数据索引等',
				},
				{
					name: 'rowKey',
					valueType: 'input',
					remark: '每行数据的唯一标识，可以是字符串或函数',
				},
				{
					name: 'pagination',
					valueType: 'object',
					remark: '分页配置，可以设置分页信息',
				},
				{
					name: 'loading',
					valueType: 'bool',
					remark: '是否加载中，显示加载状态',
				},
				{
					name: 'bordered',
					valueType: 'bool',
					remark: '是否显示边框',
				},
				{
					name: 'size',
					valueType: 'input',
					valueEnum: {
						default: { value: 'default', text: '默认大小' },
						small: { value: 'small', text: '小尺寸' },
						large: { value: 'large', text: '大尺寸' },
					},
					remark: '表格尺寸',
				},
				{
					name: 'rowSelection',
					valueType: 'object',
					remark: '行选择配置，用于实现多选或单选功能',
				},
				{
					name: 'scroll',
					valueType: 'object',
					remark: '表格的滚动配置，包括横向和纵向滚动',
				},
				{
					name: 'onChange',
					valueType: 'function',
					remark: '当分页、排序或过滤变化时的回调',
				},
				{
					name: 'onRow',
					valueType: 'function',
					remark: '为每一行提供额外的属性，例如事件处理',
				},
				{
					name: 'onHeaderRow',
					valueType: 'function',
					remark: '为表头行提供额外的属性',
				},
				{
					name: 'footer',
					valueType: 'function',
					remark: '自定义表格底部内容',
				},
			],
		},
	],
};
