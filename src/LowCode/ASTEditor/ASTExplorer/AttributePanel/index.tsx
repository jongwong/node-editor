import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';

import { Button, Form, Input, Radio, Select } from 'antd';
import { forEach, forIn, set, values } from 'lodash';
import uuid from 'uuid';

import { LowCodeMessageEvent } from '@/constant/message-event';
import { useCurrentItemChildId, useCurrentItemId } from '@/iframe-component/useIframeInstance';
import { useLowCodeInstance } from '@/LowCode/ASTEditor/ASTExplorer/useLowCodeContext';
import { getJsxNameAndImport, updateJSXTextNode } from '@/LowCode/ASTEditor/utils/ast-node';
import { updateAttributeValue } from '@/LowCode/ASTEditor/utils/operation';
import emitter from '@/utils/event';

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

	const [currentItemId] = useCurrentItemId();
	const [currentItemChildId] = useCurrentItemChildId();
	const { getNodeById, getPathKeyById, getASTJson, updateASTJson, getMaterialStore } =
		useLowCodeInstance();
	const [attributeValues, setAttributeValues] = useState<any>({});
	const [forceUpdateFormId, setForceUpdateFormId] = useState('');
	const curNode = useMemo(() => {
		return currentItemChildId ? getNodeById(currentItemChildId) : undefined;
	}, [currentItemChildId, currentItemId, forceUpdateFormId]);
	const oldValueMap = useRef({});
	const attribute = useMemo(() => {
		if (!curNode) {
			return [];
		}
		const xx = getMaterialStore();
		const re = getJsxNameAndImport(curNode, getASTJson());
		const find = getMaterialStore().data.find(
			it => it?.name === re?.name && it?.import === re?.import
		);
		return find?.attribute || [];
	}, [curNode, forceUpdateFormId]);
	useEffect(() => {
		form.resetFields();
		const map = attributeValues;

		forEach(attribute, (it, idx) => {
			const ob = {
				name: it.name,
				value: map[it.name],
			};
			form.setFields([ob]);
		});
		oldValueMap.current = map;
	}, [attributeValues, attribute, currentItemId, currentItemChildId, forceUpdateFormId]);

	useEffect(() => {
		const _handle = e => {
			setAttributeValues(e);
			setForceUpdateFormId(uuid());
		};
		emitter.on(LowCodeMessageEvent.AttributeValueChange, _handle);
		return () => {
			emitter.off(LowCodeMessageEvent.AttributeValueChange, _handle);
		};
	}, []);
	const getRender = it => {
		if (it.valueEnum) {
			const op = values(it.valueEnum);
			return <Select options={op} />;
		}
		return valueTypeMap[it.valueType]?.renderFormItem?.();
	};

	if (curNode?.type === 'JSXText') {
		return (
			<Input.TextArea
				key={currentItemChildId}
				defaultValue={curNode?.value.trim()}
				onChange={e => {
					const _node = getNodeById(currentItemChildId);
					const _path = getPathKeyById(currentItemChildId);
					const _newNode = updateJSXTextNode(_node, e.target.value);
					const ast = getASTJson();
					set(ast, _path, _newNode);
					updateASTJson?.(ast);
				}}
			/>
		);
	}

	return (
		<Form
			form={form}
			size={'small'}
			key={forceUpdateFormId}
			initialValues={attributeValues}
			onValuesChange={(changedValues, values) => {
				const ob = changedValues;
				if (Object.keys(ob).length) {
					const find = attribute?.find(it => it?.withTextChildren);

					const _path = getPathKeyById(currentItemChildId);
					const newAst = updateAttributeValue(
						curNode,
						_path,
						getASTJson(),
						ob,
						find ? { name: find?.name, oldValue: oldValueMap?.current?.[find.name] } : undefined
					);
					if (newAst) {
						oldValueMap.current = form.getFieldsValue(true);
						updateASTJson?.(newAst);
					}
				}
			}}
		>
			{attribute
				?.filter(it => it.name !== 'children')
				.map(it => (
					<Item name={it.name} key={it.name} label={it.name}>
						{getRender(it)}
					</Item>
				))}
		</Form>
	);
};
export default AttributePanel;
