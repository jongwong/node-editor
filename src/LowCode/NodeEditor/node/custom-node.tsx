/* eslint-disable */

import React from 'react';
import G6 from '@antv/g6';
import { Rect, Text, Circle, Image, Group, createNodeFromReact } from '@antv/g6-react-node';
import { ModelConfig } from '@antv/g6-core';

const r = 3;
const itDiff = r / 2 + 2;

G6.registerNode(
	'custom-node',
	{
		draw(cfg, group) {
			const size = this.getSize(cfg); // 转换成 [width, height] 的模式
			const color = cfg.color;
			if (cfg.type === 'custom-node') {
			}
			let len = cfg?.anchorText?.in?.length || 1;
			if (cfg?.anchorText?.in?.length < cfg?.anchorText?.out?.length) {
				len = cfg?.anchorText?.out?.length;
			}

			const width = 150;
			const height = size[1] + (len - 1) * 18;

			// 增加一个 path 图形作为 keyShape
			const keyShape = group.addShape('rect', {
				attrs: {
					x: cfg.x,
					y: cfg.y,
					fill: '#535d62',
					width: width,
					height: height,
					radius: [2, 2],
				},
				draggable: true,
				name: 'custom-node', // 在 G6 3.3 及之后的版本中，必须指定 name，可以是任意字符串，但需要在同一个自定义元素类型中保持唯一性
			});

			const createPoint = isOut => {
				const list = isOut ? cfg?.anchorText?.out : cfg?.anchorText?.in;
				list?.forEach((it, idx) => {
					const itX = isOut ? cfg.x + width - itDiff : cfg.x + itDiff;
					const itY = cfg.y + (height * (idx + 1)) / (len + 1);
					let textDiff = isOut ? itX - itDiff - 2 : itX + itDiff + 4;
					const _class = isOut ? 'anchor-point  anchor-point-out' : 'anchor-point  anchor-point-in';
					group.addShape('circle', {
						attrs: {
							x: itX,
							y: itY,
							fontSize: 14,
							fill: '#4d95b6',
							r: r,
							lineWidth: 3,
							strokeOpacity: 0,
							class: _class,
							textBaseline: 'middle',
						},
					});

					group.addShape('text', {
						attrs: {
							text: it.name,
							x: textDiff,
							y: itY,
							fontSize: 12,
							fill: '#8f8c8c',
							class: 'anchor-point-text',
							textAlign: isOut ? 'right' : 'left',
							textBaseline: 'middle',
						},
					});
				});
			};
			createPoint(false);

			createPoint(true);

			group.addShape('text', {
				attrs: {
					x: cfg.x + width / 2,
					y: cfg.y + height / 2,
					text: cfg.label,
					fontSize: 16,
					textAlign: 'center',
					textBaseline: 'middle',
					fill: '#f4f6f8',
					class: 'node-label',
					contenteditable: 'true',
				},
			});

			// 返回 keyShape
			return keyShape;
		},
		setState(name, value, item) {
			const group = item.getContainer();
			const shape = group.get('children')[0]; // 顺序根据 draw 时确定
			if (name === 'hover') {
				if (value) {
					shape.attr('stroke', 'rgba(67,117,173,0.75)');
					shape.attr('shadowColor', 'rgb(0,0,0)');
					shape.attr('shadowBlur', 2);
				} else {
					shape.attr('stroke', '#535d62');
					shape.attr('shadowColor', 'rgba(0,0,0,0)');
					shape.attr('shadowBlur', 0);
				}
			}
		},
		getAnchorPoints(cfg) {
			const result = [];
			let len = cfg?.anchorText?.in?.length || 1;
			if (cfg?.anchorText?.in?.length < cfg?.anchorText?.out?.length) {
				len = cfg?.anchorText?.out?.length;
			}
			const getPoint = isOut => {
				const list = isOut ? cfg?.anchorText?.out : cfg?.anchorText?.in;

				list.forEach((it, idx) => {
					result.push([isOut ? 1 : 0, (idx + 1) / (len + 1)]);
				});
			};
			getPoint(false);
			getPoint(true);
			return result;
		},
	},
	'rect'
);
