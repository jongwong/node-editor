import { isJSX } from '@babel/types';

import TableConfig from './Antd-Table';
import TabsConfig from './Antd-Tabs';

export enum EMarkType {}

const toValueEnumMap = list => {
	const ob = {};
	list.forEach(it => {
		ob[it.value] = it;
	});
	return ob;
};
const materialStore = {
	data: [
		{
			name: 'Form',
			import: 'antd',
			remark: '用于创建收集用户输入的表单组件',
			attribute: [
				{
					name: 'layout',
					valueType: 'input',
					remark: '表单布局方式',
					valueEnum: {
						horizontal: { value: 'horizontal', text: '水平布局' },
						vertical: { value: 'vertical', text: '垂直布局' },
						inline: { value: 'inline', text: '行内布局' },
					},
				},
				{
					name: 'onFinish',
					valueType: 'function',
					remark: '表单提交成功后的回调',
				},
				{
					name: 'onFinishFailed',
					valueType: 'function',
					remark: '表单提交失败后的回调',
				},
				{
					name: 'initialValues',
					valueType: 'object',
					remark: '表单的初始值',
				},
				{
					name: 'requiredMark',
					valueType: 'bool',
					remark: '是否显示必填标记',
				},
				{
					name: 'labelCol',
					valueType: 'object',
					remark: '标签布局配置',
				},
				{
					name: 'wrapperCol',
					valueType: 'object',
					remark: '内容布局配置',
				},
				{
					name: 'style',
					valueType: 'object',
					remark: '自定义样式',
				},
				{
					name: 'className',
					valueType: 'input',
					remark: '自定义类名',
				},
			],
		},
		{
			name: 'Item',
			import: 'antd',
			parentName: 'Form',
			remark: '表单中的一项，通常用于包含输入控件和相关标签',
			attribute: [
				{
					name: 'label',
					valueType: 'input',
					remark: '表单项的标签文本',
				},
				{
					name: 'tooltip',
					valueType: 'input',
					remark: '为表单项提供的提示信息',
				},
				{
					name: 'required',
					valueType: 'bool',
					remark: '是否为必填项',
				},
				{
					name: 'name',
					valueType: 'input',
					remark: '表单项的唯一名称',
				},
				{
					name: 'rules',
					valueType: 'array',
					remark: '表单项的验证规则',
				},
				{
					name: 'extra',
					valueType: 'input',
					remark: '附加信息',
				},
				{
					name: 'style',
					valueType: 'object',
					remark: '自定义样式',
				},
				{
					name: 'className',
					valueType: 'input',
					remark: '自定义类名',
				},
				{
					name: 'children',
					valueType: 'input',
					withTextChildren: true,
					remark: '表单项的子组件，通常是输入控件',
				},
			],
		},
		{
			name: 'Button',
			import: 'antd',
			display: 'inline',
			remark: '用于触发操作的按钮组件',
			attribute: [
				{
					name: 'type',
					valueType: 'input',
					remark: '按钮类型',
					valueEnum: {
						default: { value: 'default', text: '默认' },
						primary: { value: 'primary', text: '主要按钮' },
						dashed: { value: 'dashed', text: '虚线按钮' },
						link: { value: 'link', text: '链接按钮' },
						text: { value: 'text', text: '文本按钮' },
					},
				},
				{
					name: 'danger',
					valueType: 'bool',
					remark: '是否为危险按钮',
				},
				{
					name: 'shape',
					valueType: 'input',
					remark: '按钮形状',
					valueEnum: {
						default: { value: 'default', text: '默认' },
						circle: { value: 'circle', text: '圆形' },
						round: { value: 'round', text: '圆角' },
					},
				},
				{
					name: 'size',
					valueType: 'input',
					remark: '按钮尺寸',
					valueEnum: {
						large: { value: 'large', text: '大' },
						middle: { value: 'middle', text: '中' },
						small: { value: 'small', text: '小' },
					},
				},
				{
					name: 'block',
					valueType: 'bool',
					remark: '是否以块级元素展示',
				},
				{
					name: 'icon',
					valueType: 'input',
					remark: '按钮前的图标',
				},
				{
					name: 'loading',
					valueType: 'bool',
					remark: '是否加载中状态',
				},
				{
					name: 'disabled',
					valueType: 'bool',
					remark: '是否禁用按钮',
				},
				{
					name: 'ghost',
					valueType: 'bool',
					remark: '是否为幽灵按钮',
				},
				{
					name: 'htmlType',
					valueType: 'input',
					remark: '按钮的 HTML 类型',
					valueEnum: {
						button: { value: 'button', text: '普通按钮' },
						submit: { value: 'submit', text: '提交按钮' },
						reset: { value: 'reset', text: '重置按钮' },
					},
				},
				{
					name: 'children',
					valueType: 'input',
					withTextChildren: true,
					remark: '按钮的子元素，通常为文本',
				},
				{
					name: 'href',
					valueType: 'input',
					remark: '按钮链接',
				},
				{
					name: 'target',
					valueType: 'input',
					remark: '指定在何处打开链接',
				},
				{
					name: 'onClick',
					valueType: 'function',
					remark: '点击按钮时的回调',
				},
				{
					name: 'style',
					valueType: 'object',
					remark: '自定义样式',
				},
				{
					name: 'className',
					valueType: 'input',
					remark: '自定义类名',
				},
				{
					name: 'title',
					valueType: 'input',
					remark: '鼠标悬停时的提示信息',
				},
			],
			defaultAttributeValue: {
				children: '按钮',
			},
		},
		{
			name: 'Input',
			import: 'antd',
			remark: '输入框组件，用户输入文本',
			attribute: [
				{
					name: 'addonBefore',
					valueType: 'input',
					remark: '输入框前的附加元素',
				},
				{
					name: 'addonAfter',
					valueType: 'input',
					remark: '输入框后的附加元素',
				},
				{
					name: 'defaultValue',
					valueType: 'input',
					remark: '默认值',
				},
				{
					name: 'value',
					valueType: 'input',
					remark: '受控组件的值',
				},
				{
					name: 'placeholder',
					valueType: 'input',
					remark: '占位符文本',
				},
				{
					name: 'size',
					valueType: 'input',
					remark: '输入框大小',
					valueEnum: {
						large: { value: 'large', text: '大' },
						middle: { value: 'middle', text: '中' },
						small: { value: 'small', text: '小' },
					},
				},
				{
					name: 'maxLength',
					valueType: 'input',
					remark: '最大输入长度',
				},
				{
					name: 'bordered',
					valueType: 'bool',
					remark: '是否显示边框',
				},
				{
					name: 'disabled',
					valueType: 'bool',
					remark: '是否禁用',
				},
				{
					name: 'readOnly',
					valueType: 'bool',
					remark: '是否只读',
				},
				{
					name: 'allowClear',
					valueType: 'bool',
					remark: '是否支持清空按钮',
				},
				{
					name: 'showCount',
					valueType: 'bool',
					remark: '是否显示字数统计',
				},
				{
					name: 'prefix',
					valueType: 'input',
					remark: '输入框前缀',
				},
				{
					name: 'suffix',
					valueType: 'input',
					remark: '输入框后缀',
				},
				{
					name: 'type',
					valueType: 'input',
					remark: '输入框类型',
					valueEnum: {
						text: { value: 'text', text: '文本' },
						password: { value: 'password', text: '密码' },
						email: { value: 'email', text: '邮箱' },
						number: { value: 'number', text: '数字' },
					},
				},
				{
					name: 'onChange',
					valueType: 'function',
					remark: '输入内容变化时的回调',
				},
				{
					name: 'onPressEnter',
					valueType: 'function',
					remark: '按下回车键时的回调',
				},
				{
					name: 'autoFocus',
					valueType: 'bool',
					remark: '是否自动获取焦点',
				},
				{
					name: 'autoComplete',
					valueType: 'input',
					remark: '输入框的自动补全属性',
				},
				{
					name: 'inputMode',
					valueType: 'input',
					remark: '输入模式',
				},
				{
					name: 'status',
					valueType: 'input',
					remark: '输入框状态',
					valueEnum: {
						error: { value: 'error', text: '错误' },
						warning: { value: 'warning', text: '警告' },
					},
				},
				{
					name: 'className',
					valueType: 'input',
					remark: '自定义类名',
				},
				{
					name: 'style',
					valueType: 'object',
					remark: '自定义样式',
				},
				{
					name: 'htmlSize',
					valueType: 'input',
					remark: 'HTML原生的 size 属性',
				},
				{
					name: 'title',
					valueType: 'input',
					remark: '鼠标悬停时的提示信息',
				},
				{
					name: 'role',
					valueType: 'input',
					remark: 'ARIA角色',
				},
				{
					name: 'aria-label',
					valueType: 'input',
					remark: 'ARIA标签',
				},
				{
					name: 'tabIndex',
					valueType: 'input',
					remark: 'Tab键顺序',
				},
				{
					name: 'accessKey',
					valueType: 'input',
					remark: '访问键',
				},
			],
		},
		{
			name: 'Space',
			import: 'antd',
			remark: '用于在子元素之间添加间距的组件',
			attribute: [
				{
					name: 'size',
					valueType: 'input',
					remark: '间距大小，可以是数字或数组',
				},
				{
					name: 'direction',
					valueType: 'input',
					remark: '间距方向，支持 `horizontal` 和 `vertical`',
					valueEnum: {
						horizontal: { value: 'horizontal', text: '水平' },
						vertical: { value: 'vertical', text: '垂直' },
					},
				},
				{
					name: 'wrap',
					valueType: 'bool',
					remark: '是否换行',
				},
			],
		},
		{
			name: 'Row',
			import: 'antd',
			remark: '用于创建栅格布局行',
			attribute: [
				{
					name: 'gutter',
					valueType: 'input',
					remark: '行之间的间距，可以是数字或数组',
				},
				{
					name: 'justify',
					valueType: 'input',
					remark: '主轴对齐方式',
					valueEnum: {
						start: { value: 'start', text: '开始对齐' },
						end: { value: 'end', text: '结束对齐' },
						center: { value: 'center', text: '居中对齐' },
						spaceAround: { value: 'space-around', text: '环绕对齐' },
						spaceBetween: { value: 'space-between', text: '间隔对齐' },
					},
				},
				{
					name: 'align',
					valueType: 'input',
					remark: '交叉轴对齐方式',
					valueEnum: {
						top: { value: 'top', text: '顶部对齐' },
						middle: { value: 'middle', text: '居中对齐' },
						bottom: { value: 'bottom', text: '底部对齐' },
					},
				},
			],
		},
		{
			name: 'Col',
			import: 'antd',
			remark: '用于创建栅格布局列',
			attribute: [
				{
					name: 'span',
					valueType: 'input',
					remark: '当前列的栅格占比',
					valueEnum: toValueEnumMap(
						new Array(24).fill('').map((_, idx) => ({
							value: idx + 1,
							text: idx + 1,
						}))
					),
				},
				{
					name: 'offset',
					valueType: 'input',
					remark: '偏移的栅格数量',
				},
				{
					name: 'order',
					valueType: 'input',
					remark: '栅格的顺序',
				},
			],
		},
		{
			name: 'InputNumber',
			import: 'antd',
			remark: '用于数字输入的组件',
			attribute: [
				{
					name: 'min',
					valueType: 'input',
					remark: '最小值',
				},
				{
					name: 'max',
					valueType: 'input',
					remark: '最大值',
				},
				{
					name: 'step',
					valueType: 'input',
					remark: '步长',
				},
				{
					name: 'defaultValue',
					valueType: 'input',
					remark: '默认值',
				},
				{
					name: 'value',
					valueType: 'input',
					remark: '当前值',
				},
				{
					name: 'onChange',
					valueType: 'function',
					remark: '值变化时的回调',
				},
				{
					name: 'disabled',
					valueType: 'bool',
					remark: '是否禁用',
				},
				{
					name: 'precision',
					valueType: 'input',
					remark: '小数精度',
				},
			],
		},
		{
			name: 'Radio',
			import: 'antd',
			remark: '单选框组件',
			attribute: [
				{
					name: 'value',
					valueType: 'input',
					remark: '选中的值',
				},
				{
					name: 'onChange',
					valueType: 'function',
					remark: '值变化时的回调',
				},
				{
					name: 'disabled',
					valueType: 'bool',
					remark: '是否禁用',
				},
				{
					name: 'style',
					valueType: 'object',
					remark: '自定义样式',
				},
			],
		},
		{
			name: 'Checkbox',
			import: 'antd',
			remark: '复选框组件',
			attribute: [
				{
					name: 'checked',
					valueType: 'bool',
					remark: '是否选中',
				},
				{
					name: 'onChange',
					valueType: 'function',
					remark: '值变化时的回调',
				},
				{
					name: 'disabled',
					valueType: 'bool',
					remark: '是否禁用',
				},
				{
					name: 'value',
					valueType: 'input',
					remark: '复选框的值',
				},
				{
					name: 'style',
					valueType: 'object',
					remark: '自定义样式',
				},
			],
		},
		{
			name: 'Switch',
			import: 'antd',
			remark: '开关组件',
			attribute: [
				{
					name: 'checked',
					valueType: 'bool',
					remark: '是否打开',
				},
				{
					name: 'onChange',
					valueType: 'function',
					remark: '状态变化时的回调',
				},
				{
					name: 'disabled',
					valueType: 'bool',
					remark: '是否禁用',
				},
				{
					name: 'loading',
					valueType: 'bool',
					remark: '是否加载中',
				},
				{
					name: 'checkedChildren',
					valueType: 'input',
					remark: '打开时显示的内容',
				},
				{
					name: 'unCheckedChildren',
					valueType: 'input',
					remark: '关闭时显示的内容',
				},
			],
		},
		{
			name: 'Card',
			import: 'antd',
			remark: '用于展示信息的卡片组件',
			attribute: [
				{
					name: 'title',
					valueType: 'input',
					remark: '卡片标题',
				},
				{
					name: 'extra',
					valueType: 'input',
					remark: '卡片右上角的额外内容',
				},
				{
					name: 'hoverable',
					valueType: 'bool',
					remark: '鼠标悬停时是否有hover效果',
				},
				{
					name: 'bordered',
					valueType: 'bool',
					remark: '是否显示边框',
				},
				{
					name: 'style',
					valueType: 'object',
					remark: '自定义样式',
				},
				{
					name: 'className',
					valueType: 'input',
					remark: '自定义类名',
				},
			],
		},
		...TabsConfig.data,
		...TableConfig.data,
	],
};
export default materialStore;
