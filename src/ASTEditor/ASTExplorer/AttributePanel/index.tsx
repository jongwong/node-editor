import React, { useContext, useEffect, useMemo, useRef } from 'react';

import { useUpdate } from 'ahooks';
import { Button, Form, Input, Radio, Select } from 'antd';
import { forEach, forIn, set, values } from 'lodash';

import { useLowCodeInstance } from '@/ASTEditor/ASTExplorer/useLowCodeContext';
import { getJsxNameAndImport } from '@/ASTEditor/util/ast-node';
import { updateAttributeValue } from '@/ASTEditor/util/operation';

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
	currentItemId?: string;
};
const AttributePanel: React.FC<AttributePanelProps> = props => {
	const { code, ...rest } = props;
	const [form] = Form.useForm();
	const {
		currentItemChildId,
		currentItemId,
		getNodeById,
		getPathKeyById,
		getAttributeValues,
		getAst,
		updateAst,
		getMaterialStore,
	} = useLowCodeInstance();
	const curNode = useMemo(
		() => (currentItemChildId ? getNodeById(currentItemChildId) : undefined),
		[currentItemChildId, currentItemId]
	);
	const oldValueMap = useRef({});
	const attribute = useMemo(() => {
		if (!curNode) {
			return [];
		}
		const re = getJsxNameAndImport(curNode, getAst());
		const find = getMaterialStore().data.find(
			it => it?.name === re?.name && it?.import === re?.import
		);
		return find?.attribute || [];
	}, [curNode]);
	useEffect(() => {
		form.resetFields();
		const map = getAttributeValues();

		forEach(attribute, (it, idx) => {
			const ob = {
				name: it.name,
				value: map[it.name],
			};
			form.setFields([ob]);
		});
		oldValueMap.current = map;
	}, [attribute, currentItemId, currentItemChildId]);

	const getRender = it => {
		if (it.valueEnum) {
			const op = values(it.valueEnum);
			return <Select options={op} />;
		}
		return valueTypeMap[it.valueType]?.renderFormItem?.();
	};

	return (
		<Form
			form={form}
			style={{ paddingRight: '24px' }}
			onValuesChange={(changedValues, values) => {
				const ob = changedValues;
				if (Object.keys(ob).length) {
					const find = attribute?.find(it => it?.withTextChildren);

					const _path = getPathKeyById(currentItemChildId);
					const newAst = updateAttributeValue(
						curNode,
						_path,
						getAst(),
						ob,
						find ? { name: find?.name, oldValue: oldValueMap?.current?.[find.name] } : undefined
					);
					if (newAst) {
						oldValueMap.current = form.getFieldsValue(true);
						updateAst?.(newAst);
					}
				}
			}}
		>
			{attribute?.map(it => (
				<Item name={it.name} key={it.name} label={it.name}>
					{getRender(it)}
				</Item>
			))}
		</Form>
	);
};
export default AttributePanel;
