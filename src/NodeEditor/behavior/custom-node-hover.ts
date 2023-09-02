/* eslint-disable */
import G6 from '@antv/g6';
import { graph } from '@/NodeEditor/graph';

G6.registerBehavior('custom-node-hover', {
	// 设定该自定义行为需要监听的事件及其响应函数
	getEvents() {
		return {
			'node:mouseenter': 'onMouseenter',
			'node:mouseleave': 'onMouseleave',
			// "edge:mouseenter": "onMouseenter",
			// "edge:mouseleave": "onMouseleave"
		};
	},
	onMouseenter(ev: any) {
		let { item } = ev;
		this.item = item;
		// @ts-ignore
		const state = this.item.hasState('selected');

		if (!state) {
			graph.setItemState(item, 'hover', true);
		}
	},
	onMouseleave(ev: any) {
		const state = this.item.hasState('selected');
		if (!state) {
			graph.clearItemStates(this.item, 'hover');
		}
	},
});
