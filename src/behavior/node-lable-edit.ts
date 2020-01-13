import G6 from "@antv/g6";

G6.registerBehavior("node-lable-edit", {
  // 设定该自定义行为需要监听的事件及其响应函数
  getEvents() {
    return {
      "node:dblclick": "onClick",
      "canvas:click": "onCanvasClick"
    };
  },
  onCanvasClick(ev: any) {
    let model = this.item.getModel();
    model.label = "kkkkkkkkkk";
    console.log(model);
    this.graph.updateItem(this.item, model);
    this.clearInput();
  },
  clearInput(ev: any) {
    this.input = undefined;
    this.group.clear();
    this.graph.paint();
  },
  onClick: function(ev: any) {
    const graph = this.graph;
    const { item } = ev;
    console.log(ev);
    this.item = item;
    let input = this.input;
    if (!input) {
      input = this._createInput(ev);
      this.graph.paint();
    }
  },
  _createInput(ev: any) {
    const self = this;
    let canvas = self.graph.get("canvas");
    let group = canvas.addGroup({
      id: "canvas-input-group"
    });
    const html = G6.Util.createDom(
      '<input class="canvas-input" value="HTML 节点"></input>'
    );
    this.group = group;
    let { item, target } = ev;
    let itemBox = item.getBBox();
    const bbox = target.getBBox();
    const input = group.addShape("dom", {
      attrs: {
        x: itemBox.x,
        y: itemBox.y + bbox.y,
        width: itemBox.width,
        height: 30,
        html
      }
    });
    this.input = input;
    return input;
  }
});
