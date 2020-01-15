import G6, { Edge } from "@antv/g6";
import { v4 } from "uuid";
import { isAnchor } from "@/util";
import { graph } from "@/index";

G6.registerBehavior("custom-node-link", {
  // 设定该自定义行为需要监听的事件及其响应函数
  getEvents() {
    return {
      "node:mousedown": "onMousedown",
      mousemove: "onMousemove",
      mouseup: "onMouseup"
    };
  },
  notSelf(node: any) {
    try {
      const model = node.getModel();
      if (this.edge.getSource().getModel().id === model.id) return false;
    } catch (e) {}

    return true;
  },
  onMousedown(ev: any) {
    const { edgeType } = this;
    if (!isAnchor(ev)) return false;
    const node = ev.item;
    const graph = this.graph;
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
      graph.setItemState(this.edge, "draging", true);
      this.addingEdge = true;
    }
  },

  onMousemove(ev: any) {
    const { graph } = this;
    if (this.addingEdge && this.edge) {
      const point = { x: ev.x, y: ev.y };

      if (this.linkCheck(ev, "in")) {
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

  linkCheck(ev: any, mode: string) {
    const { item } = ev;

    if (!isAnchor(ev)) return false;
    if (mode && mode === "in") {
      return;
    } else if (mode && mode === "up") {
      if (!this.notSelf(item)) return;
      if (this.isExistEdge(item)) return;
      try {
        const linkRule = graph.get("defaultEdge").linkRule;
        if (linkRule) {
          let target = item;
          let source = this.edge.getSource();
          return linkRule(source, target);
        }
      } catch (e) {}
    }

    return true;
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
      // 连接检查
      if (!this.linkCheck(ev, "up")) {
        removEdge();
        return;
      }

      const id = node.getModel().id;
      const point = { x: ev.x, y: ev.y };
      let targetPoint = node.getLinkPoint(point) as any;
      graph.clearItemStates(this.edge, "draging");
      graph.updateItem(this.edge, {
        targetAnchor: targetPoint.index,
        target: id
      });

      this.edge = null;
      this.addingEdge = false;
    }
  }
});
