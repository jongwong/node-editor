import React, { useContext, useEffect, useMemo, useRef } from 'react';

import { useUpdate } from 'ahooks';
import { Button, Form, Input, Radio, Select } from 'antd';
import { forEach, forIn, set, values } from 'lodash';

import { findNodeByUid, LowCodeContext } from '@/ASTEditor/util';

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
	currentItemId?: string;
	onGetAttributeValues: () => any;
};
const AttributePanel: React.FC<AttributePanelProps> = props => {
	const { code, onGetAttributeValues, onChange, currentItemId, ast, ...rest } = props;
	const [form] = Form.useForm();
	const { dataMap } = useContext(LowCodeContext);
	const data = useMemo(
		() => (dataMap[currentItemId] ? dataMap[currentItemId] : {}),
		[dataMap, currentItemId]
	);
	const forceUpdate = useUpdate();
	const oldValueMap = useRef({});
	useEffect(() => {
		form.resetFields();
		const map = onGetAttributeValues();
		forEach(data?.config?.attribute || [], (it, idx) => {
			const ob = {
				name: it.name,
				value: map[it.name],
			};
			form.setFields([ob]);
		});
		oldValueMap.current = map;
		forceUpdate();
	}, [currentItemId, data]);

	const attribute = data?.config?.attribute || [];
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
						const ob = {};
						forEach(attribute || [], (it, key) => {
							const val = form.getFieldValue(it.name);
							if (form.isFieldTouched(it.name)) {
								ob[it.name] = val;
							}
						});
						if (Object.keys(ob).length) {
							const newAst = data?.event?.updateAttributeValue(ast, ob);
							if (newAst) {
								onChange?.(newAst);
							}
						}
					}}
				>
					保存
				</Button>
			</Item>
		</Form>
	);
};
export default AttributePanel;
