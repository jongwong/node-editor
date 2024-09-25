import { isJSX } from '@babel/types';

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
			attribute: [],
		},
		{
			name: 'Item',
			import: 'antd',
			parentName: 'Form',
			attribute: [
				{
					name: 'label',
					valueType: 'input',
				},
				{
					name: 'tooltip',
					valueType: 'input',
				},
				{
					name: 'required',
					valueType: 'bool',
				},
			],
		},
		{
			name: 'Button',
			import: 'antd',
			display: 'inline',
			attribute: [
				{
					name: 'type',
					valueType: 'input',
					valueEnum: {
						default: {
							value: 'default',
							text: 'default',
						},
						primary: {
							value: 'primary',
							text: 'primary',
						},
						dashed: {
							value: 'dashed',
							text: 'dashed',
						},
						link: {
							value: 'link',
							text: 'link',
						},
						text: {
							value: 'text',
							text: 'text',
						},
					},
				},
				{
					name: 'danger',
					valueType: 'bool',
				},
				{
					name: 'children',
					valueType: 'input',
					withTextChildren: true,
				},
			],
			defaultAttributeValue: {
				children: '按钮',
			},
		},
		{
			name: 'Input',
			import: 'antd',
			attribute: [
				{
					name: 'placeholder',
					valueType: 'input',
					type: 'JSXAttribute',
				},
			],
		},
		{
			name: 'Space',
			import: 'antd',
			attribute: [],
		},
		{
			name: 'Row',
			import: 'antd',
			attribute: [
				{
					name: 'span',
					valueType: 'input',
					valueEnum: toValueEnumMap(
						new Array(24).fill('').map((_, idx) => ({
							value: idx + 1,
							text: idx + 1,
						}))
					),
				},
			],
		},
		{
			name: 'Col',
			import: 'antd',
			attribute: [
				{
					name: 'span',
					valueType: 'input',
					valueEnum: toValueEnumMap(
						new Array(24).fill('').map((_, idx) => ({
							value: idx + 1,
							text: idx + 1,
						}))
					),
				},
			],
		},
		{
			name: 'Test',
			import: 'test',
			attribute: [
				{
					name: 'span',
					valueType: 'input',
					valueEnum: toValueEnumMap(
						new Array(24).fill('').map((_, idx) => ({
							value: idx + 1,
							text: idx + 1,
						}))
					),
				},
			],
		},
	],
};
export default materialStore;
