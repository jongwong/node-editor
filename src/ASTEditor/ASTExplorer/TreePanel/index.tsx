import React, { useMemo, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';

import traverse from '@babel/traverse';
import { Tree } from 'antd';

import { useLowCodeInstance } from '@/ASTEditor/ASTExplorer/useLowCodeContext';
import { isLowCodeElement } from '@/ASTEditor/util';
import {
	ensureProgramAst,
	getAttributeValue,
	getJSXElementName,
	renderNodeName,
} from '@/ASTEditor/util/ast-node';

const ItemTypes = {
	TreeNode: 'TreeNode',
};

interface NodeData {
	_low_code_id: string;
	_low_code_parent_id: string;
	_low_code_child_id?: string;
	component: string;
}
interface TreeNode {
	data: NodeData;
	children: TreeNode[];
}
// 将平铺的 NodeData[] 转换为树形结构
const buildTreeFromFlat = (dataArray: NodeData[]): TreeNode[] => {
	const idToNodeMap = new Map<string, TreeNode>(); // 用于存储每个节点及其子节点
	const rootNodes: TreeNode[] = []; // 用于存储树的根节点

	// 1. 初始化每个节点并存入 Map
	dataArray.forEach(data => {
		const currentNode: TreeNode = { data, children: [] };
		idToNodeMap.set(data._low_code_id, currentNode);
	});
	// 2. 根据 parentId 连接子节点
	dataArray.forEach(data => {
		const currentNode = idToNodeMap.get(data._low_code_id);
		if (!currentNode) {
			return;
		}
		const parentNode = data?.parentId ? idToNodeMap.get(data.parentId) : undefined;
		// 如果当前节点有父节点 (parentId), 将其添加到父节点的子节点列表中
		if (parentNode) {
			parentNode.children.push(currentNode);
		} else {
			// 如果当前节点没有父节点 (即是根节点), 添加到根节点列表
			rootNodes.push(currentNode);
		}
	});

	return rootNodes; // 返回根节点列表
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
					component: getJSXElementName(path.node),
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

const DraggableNode = ({ node, getNodeById, handleNodeDrop }: any) => {
	const astNodeId = node.data?._low_code_child_id || node.data?._low_code_parent_id;

	const [{ isDragging }, dragRef] = useDrag({
		type: ItemTypes.TreeNode,
		item: { id: astNodeId },
		collect: monitor => ({
			isDragging: monitor.isDragging(),
		}),
	});
	const [hoverPosition, setHoverPosition] = useState<null | string>(null);
	const [, dropRef] = useDrop({
		accept: [ItemTypes.TreeNode],
		drop: (item, monitor) => {
			const targetNodeId = astNodeId;
			const sourceNodeId = item.id;

			// Handle drop logic here, such as rearranging tree structure
			handleNodeDrop(sourceNodeId, targetNodeId);
		},
		hover: (item, monitor) => {
			const hoverBoundingRect = monitor.getClientOffset(); // 获取当前鼠标位置
			const nodeElement = document.getElementById(astNodeId); // 获取当前节点的 DOM 元素
			if (!nodeElement || !hoverBoundingRect) return;

			const { top, bottom, height } = nodeElement.getBoundingClientRect();
			const hoverMiddleY = (bottom - top) / 2;
			const hoverPositionY = hoverBoundingRect.y - top;

			if (hoverPositionY < hoverMiddleY / 2) {
				setHoverPosition(DropPosition.ABOVE);
			} else if (hoverPositionY < hoverMiddleY) {
				setHoverPosition(DropPosition.INSIDE);
			} else {
				setHoverPosition(DropPosition.BELOW);
			}
		},
	});

	const astNode = getNodeById(astNodeId);

	return (
		<div
			id={astNodeId}
			ref={node => dragRef(dropRef(node))}
			style={{ opacity: isDragging ? 0.5 : 1 }}
		>
			{/* 渲染插槽提示 */}
			{hoverPosition === DropPosition.ABOVE && <div className="drop-slot">插槽：上方</div>}
			{renderNodeName(astNode)}
			{hoverPosition === DropPosition.BELOW && <div className="drop-slot">插槽：下方</div>}
		</div>
	);
};

const TreePanel: React.FC = props => {
	const { ...rest } = props;
	const { ast, currentItemId, transformCode, getNodeById } = useLowCodeInstance();
	const treeData = useMemo(() => {
		return buildTree(ast);
	}, [ast, currentItemId]);

	return (
		<div>
			<Tree
				treeData={treeData}
				defaultExpandAll
				defaultExpandParent
				autoExpandParent
				titleRender={node => renderNodeName(getNodeById(node.data?._low_code_child_id))}
			></Tree>
		</div>
	);
};
export default TreePanel;
