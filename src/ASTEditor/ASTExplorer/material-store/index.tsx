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
			condition: path => {
				if (path.node?.name?.name === 'Item') {
					return {
						valid: true,
						markType: 10,
					};
				}
			},
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
			condition: path => {
				if (path.node?.name?.name === 'Button') {
					return {
						valid: true,
						markType: 10,
					};
				}
			},
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
			condition: path => {
				if (path.node?.name?.name === 'Input') {
					return {
						valid: true,
						markType: 10,
					};
				}
			},
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
