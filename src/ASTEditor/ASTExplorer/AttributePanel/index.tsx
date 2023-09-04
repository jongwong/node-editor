import React, { useEffect, useRef } from 'react';

import { Button, Form, Input, Radio, Select } from 'antd';

import { forIn, set, values } from 'lodash';
import { useUpdate } from 'ahooks';
import { findNodeByUid } from '@/ASTEditor/util';

const { Item } = Form;
const valueTypeMap = {
	input: {
		renderFormItem: () => <Input />,
	},
	bool: {
		renderFormItem: () => (
			<Select
				allowClear
				options={[
					{
						label: '是',
						value: true,
					},
					{
						label: '否',
						value: false,
					},
				]}
			/>
		),
	},
};

type AttributePanelProps = {
	code: string;
	ast: any;
	onChange: (e: any) => void;
	data?: string;
};
const AttributePanel: React.FC<AttributePanelProps> = props => {
	const { code, onChange, ast, data, ...rest } = props;
	const [form] = Form.useForm();
	const forceUpdate = useUpdate();
	const oldValueMap = useRef({});
	useEffect(() => {
		form.resetFields();
		let map = {};
		forIn(data?.attributeValueMap || {}, (it, key) => {
			const ob = {
				name: key,
				value: it.getValue(),
			};
			map[key] = ob.value;
			form.setFields([ob]);
		});
		oldValueMap.current = map;
		forceUpdate();
	}, [data]);

	const attribute = data?.materialData?.attribute || [];
	const getRender = it => {
		if (it.valueEnum) {
			const op = values(it.valueEnum);
			return <Select options={op} />;
		}
		return valueTypeMap[it.valueType]?.renderFormItem?.();
	};
	return (
		<Form form={form} style={{ paddingRight: '24px' }}>
			{attribute?.map(it => (
				<Item name={it.name} key={it.name} label={it.name}>
					{getRender(it)}
				</Item>
			))}
			<Item>
				<Button
					type="primary"
					onClick={() => {
						let newAst = ast;
						forIn(data?.attributeValueMap || {}, (it, key) => {
							const val = form.getFieldValue(key);

							if (val?.toString() !== oldValueMap.current[key]?.toString()) {
								newAst = it.updateValue(newAst, val);
							}
						});
						onChange?.(ast);
					}}>
					保存
				</Button>
			</Item>
		</Form>
	);
};
export default AttributePanel;
