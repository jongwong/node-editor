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
  nodeCache: [],
  onAllDragStart(ev: any) {},
  onDragStart(ev: any) {
    this.nodeCache = [];
    if (isAnchor(ev)) return;
    const nodes = graph.findAllByState("node", "selected");
    if (nodes.length > 0) {
      nodes.forEach((item: any) => {
        const model = item.getModel();
        this.nodeCache.push({
          id: model.id,
          node: item,
          dx: model.x - ev.x,
          dy: model.y - ev.y
        });
      });
    } else {
      const { item } = ev;
      const model = item.getModel();
      this.nodeCache.push({
        id: model.id,
        node: item,
        dx: model.x - ev.x,
        dy: model.y - ev.y
      });
    }
  },
  onDrag(ev: any) {
    if (this.nodeCache.length > 0) {
      this.nodeCache.forEach((item: any) => {
        graph.update(item.node, {
          x: ev.x + item.dx,
          y: ev.y + item.dy
        });
      });
    }
  },
  onDragEnd(ev: any) {
    this.nodeCache = [];
  }
});
