import G6 from "@antv/g6";

G6.registerBehavior("custom-node-hover", {
  // 设定该自定义行为需要监听的事件及其响应函数
  getEvents() {
    return {
      mouseenter: "onMouseenter",
      mouseleave: "onMouseleave"
    };
  },
  nodeCache: {
    node: null,
    dx: null,
    dy: null
  },
  onMouseenter(ev: any) {},
  onMouseleave(ev: any) {}
});
