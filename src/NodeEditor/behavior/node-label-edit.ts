/* eslint-disable */
import G6 from '@antv/g6';
import { hasClassName } from '@/util';

G6.registerBehavior('node-label-edit', {
	// 设定该自定义行为需要监听的事件及其响应函数
	getEvents() {
		return {
			'node:dblclick': 'onClick',
			keydown: 'onKeydown',
			'canvas:click': 'onCanvasClick',
		};
	},
	onKeydown(ev: any) {
		let { key } = ev;
		if (key === 'Enter' && this.input && this.lableTarget && this.group) {
			this.onCanvasClick(ev);
		}
	},
	onCanvasClick(ev: any) {
		if (this.item) {
			const graph = this.graph;
			const autoPaint = graph.get('autoPaint');
			graph.setAutoPaint(false);
			let model = this.item.getModel();
			model.label = this.inputEl.value;

			graph.updateItem(this.item, model);
			this.item.clearCache();
			graph.refreshItem(this.item);
			graph.paint();
			graph.setAutoPaint(autoPaint);
		}
		this.clearInput();
		if (this.lableTarget) {
			this.lableTarget.show();
			this.lableTarget = undefined;
		}
		this.input = undefined;
	},
	clearInput(ev: any) {
		if (this.group) {
			this.group.clear();
			this.graph.paint();
		}
	},
	isLabel(ev: any) {
		return ev.target && hasClassName(ev.target, 'node-label');
	},
	onClick: function (ev: any) {
		if (!this.isLabel(ev)) {
			return;
		}
		const graph = this.graph;
		const { item, target } = ev;
		this.lableTarget = target;
		target.hide();
		this.item = item;
		let input = this.input;

		if (!input || !this.inputEl) {
			input = this._createInput(ev);
		}
	},
	_createInput(ev: any) {
		const self = this;
		let { item, target } = ev;
		console.log('======ev====>', target);

		this.group = target.cfg?.parent;
		this.target = target;

		const group = this.group;

		let itemBox = item.getBBox();
		const bbox = target.getBBox();
		const input = group.addShape('dom', {
			attrs: {
				x: itemBox.x,
				y: itemBox.y,
				width: itemBox.width,
				height: itemBox.height,
				html: ` <input/>`,
			},
		});
		this.input = input;
		return input;
	},
});
