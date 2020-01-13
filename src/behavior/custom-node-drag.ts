import G6 from "@antv/g6";
import { graph } from "@/index";
import { isAnchor } from "@/util";

G6.registerBehavior("custom-node-drag", {
  // 设定该自定义行为需要监听的事件及其响应函数
  getEvents() {
    return {
      "node:dragstart": "onDragStart",
      "node:drag": "onDrag",
      "node:dragend": "onDragEnd"
    };
  },
  nodeCache: {
    node: null,
    dx: null,
    dy: null
  },
  onDragStart(ev: any) {
    if (isAnchor(ev)) return;
    const { item } = ev;
    const model = item.getModel();
    this.nodeCache.node = item;
    this.nodeCache.dx = model.x - ev.x;
    this.nodeCache.dy = model.y - ev.y;
  },
  onDrag(ev: any) {
    this.nodeCache.node &&
      graph.update(this.nodeCache.node, {
        x: ev.x + this.nodeCache.dx,
        y: ev.y + this.nodeCache.dy
      });
  },
  onDragEnd(ev: any) {
    this.nodeCache.node = undefined;
  }
});
