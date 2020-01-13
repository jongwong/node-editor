import G6 from "@antv/g6";
import { graph } from "@/index";
const min = Math.min;
const max = Math.max;
const abs = Math.abs;
G6.registerBehavior("custom-brush-select", {
  brushStyle: {
    class: "selected-brush-left"
  },
  // 设定该自定义行为需要监听的事件及其响应函数
  getEvents() {
    return {
      "canvas:mousedown": "onMousedown",
      mousemove: "onMousemove",
      mouseup: "onMouseup",
      "canvas:click": "clearStates"
    };
  },
  clearStates(ev: any) {
    const graph = this.graph;
    const autoPaint = graph.get("autoPaint");
    graph.setAutoPaint(false);
    const selectedState = this.selectedState;

    const nodes = graph.findAllByState("node", selectedState);
    const edges = graph.findAllByState("edge", selectedState);
    nodes.forEach((node: any) =>
      graph.setItemState(node, selectedState, false)
    );
    edges.forEach((edge: any) =>
      graph.setItemState(edge, selectedState, false)
    );

    this.selectedNodes = [];

    this.selectedEdges = [];
    this.onDeselect && this.onDeselect(this.selectedNodes, this.selectedEdges);
    graph.emit("node-select-change", {
      targets: {
        nodes: [],
        edges: []
      },
      select: false
    });
    graph.paint();
    graph.setAutoPaint(autoPaint);
  },

  onMousedown(ev: any) {
    const { item } = ev;

    if (item) {
      return;
    }

    if (this.selectedNodes && this.selectedNodes.length !== 0) {
      this.clearStates();
    }

    let brush = this.brush;
    if (!brush) {
      brush = this._createBrush();
    }
    this.originPoint = { x: ev.canvasX, y: ev.canvasY };
    brush.attr({ width: 0, height: 0 });
    brush.show();
    this.dragging = true;
  },
  _createBrush() {
    const self = this;
    let canvas = self.graph.get("canvas");
    let group = canvas.addGroup({
      id: "selected-brush"
    });
    this.group = group;
    const brush = group.addShape("rect", {
      attrs: this.brushStyle,
      capture: false
    });
    this.brush = brush;
    return brush;
  },
  _clearBrush() {
    this.brush = undefined;
    this.group.clear();
  },
  clearState: (item: any) => {
    if (item.hasState("selected")) {
      graph.clearItemStates(item, "selected");
    }
  },
  clearStateAll() {
    let nodes = graph.findAllByState("node", "selected");
    nodes.forEach((node: any) => {
      this.clearState(node);
    });
    let edges = graph.findAllByState("edge", "selected");
    edges.forEach((item: any) => {
      const style = item.getStateStyle("selected");
      console.log(style);
      this.clearState(item);
    });
    this.selectedNodes = [];
  },
  setStateAll() {
    if (this.selectedNodes.length > 0) {
      this.selectedNodes.forEach((node: any) => {
        graph.setItemState(node, "selected", true);
      });
    }
    if (this.selectedEdges.length > 0) {
      this.selectedEdges.forEach((item: any) => {
        const style = item.getStateStyle("selected");
        graph.setItemState(item, "selected", true);
      });
    }
  },
  _updateBrush(ex: any) {
    const graph = this.graph;
    let mode = "left";
    const originPoint = this.originPoint;
    const p1 = graph.getPointByCanvas(originPoint.x, originPoint.y);
    const p2 = { x: ex.x, y: ex.y };
    if (p1.x > p2.x) {
      mode = "right";
    }
    this.brushStyle.class = "selected-brush-" + mode;
    this.brush.attr({
      width: abs(ex.canvasX - originPoint.x),
      height: abs(ex.canvasY - originPoint.y),
      x: min(ex.canvasX, originPoint.x),
      y: min(ex.canvasY, originPoint.y),
      class: this.brushStyle.class
    });
  },

  onMousemove(ev: any) {
    if (!this.dragging) {
      return;
    }
    this._updateBrush(ev);
    this.graph.paint();
  },
  onMouseup(ev: any) {
    if (!this.brush && !this.dragging) {
      return;
    }
    const graph = this.graph;
    const autoPaint = graph.get("autoPaint");
    graph.setAutoPaint(false);
    this.clearStateAll();
    this._getSelectedNodes(ev);
    this.setStateAll();
    this.dragging = false;
    this._clearBrush();
    this.graph.paint();
    graph.setAutoPaint(autoPaint);
  },
  _getSelectedNodes(e: any) {
    let mode = "left";
    const graph = this.graph;
    const state = this.selectedState;
    const originPoint = this.originPoint;
    const p1 = graph.getPointByCanvas(originPoint.x, originPoint.y);
    const p2 = { x: e.x, y: e.y };
    if (p1.x > p2.x) {
      mode = "right";
    }
    const left = min(p1.x, p2.x);
    const right = max(p1.x, p2.x);
    const top = min(p1.y, p2.y);
    const bottom = max(p1.y, p2.y);
    const selectedNodes: Array<any> = [];
    const selectedEdges: Array<any> = [];
    const shouldUpdate = this.shouldUpdate;
    const selectedIds: Array<any> = [];
    graph.getNodes().forEach((node: any) => {
      const bbox = node.getBBox();
      let condition =
        bbox.minX >= left &&
        bbox.maxX <= right &&
        bbox.minY >= top &&
        bbox.maxY <= bottom;

      // left < x < right 交于 minX < x < minY && top < y < bottom 交于 top < y < bottom
      if (mode === "right") {
        condition =
          right >= bbox.minX &&
          left < bbox.maxX &&
          bottom >= bbox.minY && top < bbox.maxY;
      }

      if (condition) {
        if (shouldUpdate(node, "select")) {
          selectedNodes.push(node);
          const model = node.getModel();
          selectedIds.push(model.id);
        }
      }
    });

    graph.getEdges().forEach((node: any) => {
      const bbox = node.getBBox();
      let condition =
        bbox.minX >= left &&
        bbox.maxX <= right &&
        bbox.minY >= top &&
        bbox.maxY <= bottom;
      if (mode === "right") {
        condition =
          (bbox.minX <= right && bbox.minX >= left) ||
          (bbox.maxX <= right &&
            bbox.maxX >= left &&
            bbox.minY <= bottom &&
            bbox.minY >= top) ||
          (bbox.maxY <= top && bbox.maxY >= bottom);
      }

      if (condition) {
        if (shouldUpdate(node, "select")) {
          selectedEdges.push(node);
          const model = node.getModel();
          selectedIds.push(model.id);
        }
      }
    });

    this.selectedEdges = selectedEdges;
    this.selectedNodes = selectedNodes;
    this.onSelect && this.onSelect(selectedNodes, selectedEdges);
    graph.emit("node-select-change", {
      targets: {
        nodes: selectedNodes,
        edges: selectedEdges
      },
      select: true
    });
  }
});
