import { isJSX } from '@babel/types';

export enum EMarkType {}

const materialStore = {
	data: [
		{
			name: 'Form',
			import: 'antd',
		},
		{
			name: 'Item',
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
					type: 'JSXAttribute',
				},
			],
		},
		{
			name: 'Input',
			attribute: [
				{
					name: 'placeholder',
					valueType: 'input',
					type: 'JSXAttribute',
				},
			],
		},
	],
};
export default materialStore;
