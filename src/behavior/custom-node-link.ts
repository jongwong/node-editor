import G6 from "@antv/g6";
import { v4 } from "uuid";
import { isAnchor } from "@/util";

G6.registerBehavior("custom-node-link", {
  // 设定该自定义行为需要监听的事件及其响应函数
  getEvents() {
    return {
      "node:mousedown": "onMousedown",
      mousemove: "onMousemove",
      mouseup: "onMouseup"
    };
  },
  addEdgeCheck(ev: any, inFlag = undefined) {
    const { graph } = this;
    const linkRule = graph.get("defaultEdge").linkRule;
    // 如果点击的不是锚点就结束
    if (!isAnchor(ev)) return false;
    // 出入度检查
    // return checkOutAndInEdge(ev.item as Node, inFlag, linkRule);
    return true;
  },
  notSelf(ev: any) {
    const node = ev.item;
    const model = node.getModel();
    if (this.edge.getSource().getModel().id === model.id) return false;
    return true;
  },
  onMousedown(ev: any) {
    const { edgeType } = this;
    if (!this.addEdgeCheck.call(this, ev, "out")) return;
    const node = ev.item;
    const graph = this.graph;
    const linkRule = graph.get("defaultEdge").linkRule;
    this.sourceNode = node;
    const point = { x: ev.x, y: ev.y };
    const model = node.getModel();
    let sourcePoint = node.getLinkPoint(point);
    if (!this.addingEdge && !this.edge) {
      const item = {
        id: v4() + "",
        source: model.id,
        target: point,
        sourceAnchor: sourcePoint.index,
        shape: "custom-edge"
      };
      this.edge = graph.addItem("edge", item);
      this.addingEdge = true;
    }
  },

  onMousemove(ev: any) {
    const { graph } = this;
    if (this.addingEdge && this.edge) {
      const point = { x: ev.x, y: ev.y };
      // 鼠标放置到一个锚点上时，更新边
      // 否则只更新线的终点位置
      if (this.addEdgeCheck.call(this, ev, "in") && this.notSelf(ev)) {
        const node = ev.item;
        const model = node.getModel();
        graph.updateItem(this.edge, {
          targetAnchor: ev.target.get("index"),
          target: model.id
        });
      } else graph.updateItem(this.edge, { target: point });
    }
  },
  // 两节点是否存在有边
  isExistEdge(node: any) {
    if (this.allowMultiEdge) return true;

    const source = this.edge.getSource();
    let target: any;
    try {
      target = this.edge.getTarget();
    } catch (e) {}

    if (!source || !target) return true;
    let edges: any;
    try {
      edges = node.getEdges();
    } catch (e) {}
    if (edges && edges.length > 0) {
      return edges.some((edge: any) => {
        const sourceId = edge.getSource().getModel().id;
        const targetId = edge.getTarget().getModel().id;
        if (
          sourceId === source.getModel().id &&
          targetId === target.getModel().id
        ) {
          return true;
        } else {
          return false;
        }
      });
    } else {
      return false;
    }
  },

  onMouseup(ev: any) {
    const { graph, sourceNode } = this;
    const node = ev.item;
    const removEdge = () => {
      graph.removeItem(this.edge);
      this.edge = null;
      this.addingEdge = false;
    };
    if (this.addingEdge && this.edge) {
      // 禁止自己连自己
      if (!this.notSelf(ev) || !this.isExistEdge(node)) {
        removEdge();
        return;
      }

      const id = node.getModel().id;
      const point = { x: ev.x, y: ev.y };
      let targetPoint = node.getLinkPoint(point) as any;
      graph.updateItem(this.edge, {
        targetAnchor: targetPoint.index,
        target: id
      });
      this.edge = null;
      this.addingEdge = false;
    }
  }
});
