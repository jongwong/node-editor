import G6, { Util } from '@antv/g6';
import { cloneDeep } from 'lodash';

// 使用方法二：自定义边，并带有自定义箭头

G6.registerEdge(
	'custom-edge',
	{
		options: {
			size: 60,
			style: {
				lineWidth: 1,
				lineAppendWidth: 5,
			},
			// stateStyles: {
			//     hover: {
			//         class: "graph-edge-hover"
			//     },
			//     dragging: {
			//         class: "graph-edge-dragging"
			//     },
			//     // 选中节点状态下的配置
			//     selected: {
			//         class: "graph-edge-selected"
			//     }
			// }
		} as any,
		draw(cfg, group) {
			const { startPoint, endPoint } = cfg;

			const keyShape = group.addShape('path', {
				attrs: {
					path: [
						['M', startPoint.x, startPoint.y],
						['L', endPoint.x, endPoint.y],
					],
					stroke: '#496a70',
					lineWidth: 1,
					lineAppendWidth: 5,
				},
				// 在 G6 3.3 及之后的版本中，必须指定 name，可以是任意字符串，但需要在同一个自定义元素类型中保持唯一性
				name: 'custom-edge',
			});
			return keyShape;
		},
		// getControlPoints(cfg) {
		//     const { startPoint, endPoint } = cfg;
		//     let len1 = 30;
		//     if (Math.abs(endPoint.x - startPoint.x) < 60) {
		//         len1 = 5;
		//     }
		//     const innerPoint1 = {
		//         x: len1 + startPoint.x,
		//         y: startPoint.y
		//     };
		//     const innerPoint2 = {
		//         x: endPoint.x - startPoint.x - len1 + startPoint.x,
		//         y: endPoint.y
		//     };
		//     const controlPoints = [innerPoint1, innerPoint2];
		//     return controlPoints;
		// },

		setState(name, value, item) {
			const group = item.getContainer();
			const shape = group.get('children')[0]; // 顺序根据 draw 时确定
			if (name === 'hover') {
				if (value) {
					shape.attr('stroke', 'red');
				} else {
					shape.attr('stroke', '#333');
				}
			}
			if (name === 'selected') {
				if (value) {
					shape.attr('stroke', 'red');
					shape.attr('lineWidth', 3);
				} else {
					shape.attr('lineWidth', 2);
				}
			}
		},
	},
	'cubic-horizontal'
);
