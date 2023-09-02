/* eslint-disable */
import G6 from '@antv/g6';

import Graph from '@antv/g6-pc/lib/graph/graph';
import './behavior';
import './node/custom-edge';
import './node/custom-node';
// import "./operation/addItem";

const grid = new G6.Grid();
const minimap = new G6.Minimap({
	size: [200, 150],
	className: 'minimap',
	type: 'delegate',
});

// [
//   {
//     type: "custom-node-drag"
//   },
//   {
//     type: "custom-node-link"
//   },
//   {
//     type: "custom-brush-select"
//   },
//   {
//     type: "custom-node-select"
//   },
//   {
//     type: "node-label-edit"
//   },
//   {
//     type: "custom-node-hover"
//   },
//   {
//     type: "zoom-canvas"
//   },
//   {
//     type: "key-cache"
//   },
//   {
//     type: "key-cache"
//   },
//   {
//     type: "custom-canvas-drag"
//   }
// ]
// graph.set("keyCache", []);
// graph.on("node-select-change", (ev: any) => {
//   let { targets } = ev;
//   let { nodes, edges } = targets;
//   graph.set("selectCache", { nodes, edges });
// });
// graph.on("keyup", (ev: any) => {
//   let { key } = ev;
//   if (key === "Delete") {
//     let { nodes, edges } = graph.get("selectCache");
//     nodes.forEach((item: any) => {
//       try {
//         if (item.getModel().id !== "view") {
//           graph.removeItem(item);
//         }
//       } catch (e) {}
//     });
//     edges.forEach((item: any) => {
//       try {
//         if (item.getModel().id !== "view") {
//           graph.removeItem(item);
//         }
//       } catch (e) {}
//     });
//   }
// });

const toolbar = new G6.ToolBar();
const initData = {
	nodes: [
		{
			id: 'node1',
			label: 'node 1',
			x: 100,
			y: 100,
			data: {},
			anchorText: {
				in: [{ name: 'IN', tooltip: 'this is node1 in' }, { name: 'p1' }],
				out: [{ name: 'OUT' }],
			},
			type: 'custom-node',
		},
		{
			id: 'node2',
			label: 'node 2',
			x: 500,
			y: 100,
			data: {},
			anchorText: {
				in: [{ name: 'IN' }, { name: 'p1' }],
				out: [{ name: 'OUT' }],
			},
			type: 'custom-node',
		},
		{
			id: 'node3',
			label: 'node 3',
			x: 100,
			y: 200,
			data: {},
			anchorText: {
				in: [{ name: 'IN' }, { name: 'p1' }],
				out: [{ name: 'OUT' }],
			},
			type: 'custom-node',
		},
		{
			id: 'node4',
			label: 'node 4',
			x: 500,
			y: 200,
			data: {},
			anchorText: {
				in: [{ name: 'IN' }, { name: 'p1' }],
				out: [{ name: 'OUT' }],
			},
			type: 'custom-node',
		},
	],
	edges: [
		{
			id: '1',
			source: 'node1',
			target: 'node2',
			sourceAnchor: 0,
			targetAnchor: 2,
			type: 'custom-edge',
		},
	],
};
export let graph: Graph;
export const init = el => {
	graph = new G6.Graph({
		container: el,
		height: 700,
		renderer: 'svg',
		// defaultEdge: {
		//   linkRule: function(source: any, target: any) {
		//     return true;
		//   }
		// },
		plugins: [minimap, grid],
		modes: {
			default: [
				{
					type: 'scroll-canvas',
					zoomKey: 'shift',
				},
				{
					type: 'drag-node',
				},
				'custom-node-hover',
				{
					type: 'click-select',
					multiple: false,
				},
				'custom-node-link',
				'node-label-edit',
			],
		},
		defaultCombo: {
			type: 'rect',
			// 其他配置
		},

		nodeStateStyles: {},
	});

	graph.data(initData);
	graph.render();

	(window as any)['graph'] = graph;
};
