import React, { useEffect, useMemo, useState } from 'react';

import {
	AppstoreOutlined,
	CaretDownOutlined,
	DeploymentUnitOutlined,
	DownOutlined,
	FolderOutlined,
	RightOutlined,
} from '@ant-design/icons';
import traverse from '@babel/traverse';
import { Tree } from '@minoru/react-dnd-treeview';
import uuid from 'uuid';

import IconFont from '@/components/IconFont';
import { LowCodeMessageEvent } from '@/constant/message-event';
import useOpenAttribute from '@/iframe-component/handle/useOpenAttribute';
import { useLowCodeInstance } from '@/LowCode/ASTEditor/ASTExplorer/useLowCodeContext';
import {
	ensureProgramAst,
	getAttributeValue,
	getJSXElementName,
	renderNodeName,
} from '@/LowCode/ASTEditor/utils/ast-node';

// @ts-ignore
import './index.less';
import 'react-arborist/src/';

const ItemTypes = {
	TreeNode: 'TreeNode',
};

interface NodeData {
	_low_code_id: string;
	_low_code_parent_id: string;
	_low_code_child_id?: string;
	componentName: string;
	location: string;
	parentId: string;
}
interface TreeNode {
	data: NodeData;
	children: TreeNode[];
	id: string;
	parent: string;
	text: string;
}
// 将平铺的 NodeData[] 转换为树形结构
const buildTreeFromFlat = (dataArray: NodeData[]): TreeNode[] => {
	const idToNodeMap = new Map<string, TreeNode>(); // 用于存储每个节点及其子节点
	const rootNodes: TreeNode[] = []; // 用于存储树的根节点
	const map = {};
	const notLeafOb = {};
	dataArray.forEach(data => {
		map[data._low_code_id] = true;
	});
	// 1. 初始化每个节点并存入 Map
	const list = dataArray.map(data => {
		const currentNode: TreeNode = {
			id: data._low_code_id,
			text: data.componentName,
			data,
		};
		if (data?.parentId && map[data?.parentId]) {
			currentNode.parent = data?.parentId;
			notLeafOb[data?.parentId] = true;
		} else {
			currentNode.parent = 0;
		}
		// idToNodeMap.set(data._low_code_id, currentNode);
		return currentNode;
	});

	return list.map(it => {
		return {
			...it,
			isLeaf: !notLeafOb[it?.id],
		};
	});
};
const isDescendantOf = (childLocation: string, parentLocation: string): boolean => {
	// 判断 childLocation 是否是 parentLocation 的后代
	// 假设路径是字符串，使用字符串包含关系来判断
	return childLocation.startsWith(parentLocation) && childLocation !== parentLocation;
};

const assignParentIds = (nodes: NodeData[], nodeLocations: { [id: string]: string }): void => {
	nodes.forEach(node => {
		let parentId: string | null = null;

		// 遍历所有节点，找到最近的父节点
		for (const [id, location] of Object.entries(nodeLocations)) {
			// 确保不是自己，并且是后代
			if (id !== node._low_code_id && isDescendantOf(node.location, location)) {
				parentId = id;
				break; // 找到最近的父节点后就退出循环
			}
		}

		// 如果找到父节点，更新当前节点的 parentId
		if (parentId) {
			node.parentId = parentId;
		}
	});
};
const DropPosition = {
	ABOVE: 'ABOVE',
	INSIDE: 'INSIDE',
	BELOW: 'BELOW',
};
const buildTree = (ast: any): TreeNode[] => {
	const result: NodeData[] = [];
	const map: Record<string, boolean> = {};
	const nodeLocations: { [id: string]: string } = {}; // 用于记录每个节点的路径位置

	// 1. 在 traverse 过程中仅做过滤和记录位置
	traverse(ensureProgramAst(ast), {
		exit(path) {
			// 只处理指定类型的节点
			if (getJSXElementName(path.node) === 'LowCodeDragItem') {
				const _el = path.node?.openingElement;
				const data: NodeData = {
					_low_code_id: getAttributeValue(_el, '_low_code_id'),
					_low_code_parent_id: getAttributeValue(_el, '_low_code_parent_id'),
					_low_code_child_id: getAttributeValue(_el, '_low_code_child_id'),
					componentName: getJSXElementName(path.node.children[0]) || 'Text',
					location: path.getPathLocation(), // 记录节点位置
				};

				// 防止重复处理同一个节点
				if (!map[data._low_code_id]) {
					map[data._low_code_id] = true;
					result.push(data);
					nodeLocations[data._low_code_id] = data.location; // 记录该节点的位置
				}
			}
		},
	});
	// 2. 根据记录的节点位置来判断父子关系
	assignParentIds(result, nodeLocations);

	// 3. 将扁平的节点数据转为树形结构
	return buildTreeFromFlat(result);
};

const TreePanel: React.FC = props => {
	const [treeData, setTreeData] = useState([]);

	const openAttributeHandle = useOpenAttribute();
	const handleDrop = newTreeData => setTreeData(newTreeData);
	const { AstJson, currentItemId, transformCode, getNodeById } = useLowCodeInstance();

	const [forceUpdateKey, setForceUpdateKey] = useState('');
	const [openKeys, setOpenKeys] = useState<string[]>([]);
	useEffect(() => {
		const li = buildTree(AstJson);
		setOpenKeys(li?.map(it => it.id));
		// setOpenKeys(li.map(it => it.id));
		if (!openKeys.length) {
			setTimeout(() => {
				setTreeData(li);
			}, 1000);
		}
		setForceUpdateKey(uuid.v4());
	}, [AstJson, currentItemId]);

	const getIconByName = (name: string, node) => {
		const _name = name.toLowerCase();
		if (_name === 'text') {
			const iframe = document.querySelector('#lowcode-preview') as HTMLIFrameElement;
			const doc = iframe?.contentDocument;
			const pEl = doc?.getElementById(node.data._low_code_id);
			const el = pEl?.children[1];
			const text = el?.textContent?.trim() || '';
			return (
				<>
					<IconFont style={{ fontSize: 14, paddingRight: 4 }} type="yh-text-recognition" />{' '}
					{text || _name}
				</>
			);
		}
		return (
			<>
				<DeploymentUnitOutlined style={{ fontSize: 14, paddingRight: 4 }} />
				{name}
			</>
		);
	};
	return (
		<Tree
			tree={treeData}
			onDrop={handleDrop}
			key={forceUpdateKey}
			render={(node, { depth, isOpen, onToggle }) => (
				<div
					style={{ marginLeft: depth * 16 }}
					onDoubleClick={e => {
						const data = node?.data || {};
						openAttributeHandle(
							{
								_low_code_id: data?._low_code_id,
								_low_code_child_id: data?._low_code_child_id,
								_low_code_parent_id: data?._low_code_parent_id,
								_low_code_type: data?.componentName === 'Text' ? 'JSXText' : 'JSXElement',
							},
							{}
						);
					}}
				>
					{!node?.isLeaf ? (
						<span onClick={onToggle} style={{ fontSize: 10, paddingRight: 4 }}>
							{isOpen ? <DownOutlined /> : <RightOutlined />}
						</span>
					) : (
						<span style={{ padding: '0 0.5em', display: 'inline-block' }} />
					)}
					{getIconByName(node.text, node)}
				</div>
			)}
			sort={false}
			initialOpen={openKeys}
			insertDroppableFirst={false}
			canDrop={(tree, { dragSource, dropTargetId }) => {
				if (dragSource?.parent === dropTargetId) {
					return true;
				}
			}}
			rootId={0}
			dragPreviewRender={monitorProps => <CustomDragPreview monitorProps={monitorProps} />}
			dropTargetOffset={10}
			placeholderRender={(node, { depth }) => <Placeholder node={node} depth={depth} />}
		/>
	);
};
export default TreePanel;
export const Placeholder: React.FC<any> = props => {
	const left = props.depth * 24;
	return (
		<div
			style={{
				// backgroundColor: '#1967d2',
				// height: '2px',
				// position: 'absolute',
				// right: 0,
				// transform: 'translateY(-50%)',
				// top: 0,
				left,
			}}
		></div>
	);
};
const CustomDragPreview: React.FC<any> = props => {
	const item = props.node;

	return <div style={{}}>{item?.text}</div>;
};
