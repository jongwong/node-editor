import React, { useEffect, useState } from 'react';

import { Col, Form, Row } from 'antd';
import { forIn, groupBy, keys, values } from 'lodash';

import MaterialItem from '@/ASTEditor/ASTExplorer/MaterialPanel/MaterialItem';
import { generateCodeAll } from '@/ASTEditor/ASTExplorer/MaterialPanel/utils';

import materialStore from '../material-store';

const MaterialPanel: React.FC = props => {
	const { ...rest } = props;

	const [materialCodeText, setMaterialCodeText] = useState('');
	const [groupList, setGroupList] = useState<{ name: string; data: any[] }[]>([]);
	useEffect(() => {
		const _data = groupBy(materialStore.data, it => it.import);
		setMaterialCodeText(generateCodeAll());

		setGroupList(keys(_data || {}).map(it => ({ name: it, data: _data[it] })));
	}, []);

	return materialCodeText ? (
		<div>
			{groupList.map(it => {
				return (
					<Row gutter={[5, 5]} key={it.name}>
						{it.data.map(it => (
							<Col key={it.name}>
								<MaterialItem data={it}></MaterialItem>
							</Col>
						))}
					</Row>
				);
			})}

			{/*<CodePreview*/}
			{/*	files={[{ filename: '_low-code-material.tsx', code: materialCodeText }]}*/}
			{/*	demoId="modalPath"*/}
			{/*/>*/}
		</div>
	) : null;
};
export default MaterialPanel;
