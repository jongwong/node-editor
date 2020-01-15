import G6 from "@antv/g6";
import { graph } from "@/index";

G6.registerBehavior("custom-node-select", {
  // 设定该自定义行为需要监听的事件及其响应函数
  getEvents() {
    return {
      "node:click": "onClick",
      "edge:click": "onClick",
      "canvas:click": "onCanvasClick"
    };
  },
  nodeCache: [],
  clearState: (item: any) => {
    try {
      if (item.hasState("selected")) {
        graph.clearItemStates(item, "selected");
      }
    } catch (e) {}
  },
  clearAll() {
    if (this.nodeCache.length > 0) {
      this.nodeCache.forEach((node: any) => {
        this.clearState(node);
      });
    }
    this.nodeCache = [];
  },
  onCanvasClick(ev: any) {
    this.clearAll();
  },
  onClick(ev: any) {
    ev.preventDefault();

    if (!this.shouldUpdate.call(this, ev)) {
      return;
    }
    const { item, target } = ev;
    let labelClass = target._attrs.class;
    if (labelClass === "node-label") {
      return;
    }
    const state = item.hasState("selected");
    let keyCache = graph.get("keyCache");

    if (keyCache.includes("Shift")) {
      if (state) {
        graph.clearItemStates(item, "selected");

        this.nodeCache = this.nodeCache.filter((node: any) => {
          return node._cfg.id === item._cfg.id;
        });
      } else {
        graph.setItemState(item, "selected", true);
        this.nodeCache.push(item);
      }
    } else {
      this.clearAll();
      if (state) {
        graph.clearItemStates(item, "selected");
      } else {
        this.nodeCache.push(item);
        graph.setItemState(item, "selected", true);
      }
    }
    graph.emit("node-select-change", {
      targets: {
        nodes: this.nodeCache,
        edges: []
      },
      select: true
    });
  }
});
