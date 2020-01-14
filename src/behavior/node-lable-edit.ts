import G6 from "@antv/g6";

G6.registerBehavior("node-lable-edit", {
  // 设定该自定义行为需要监听的事件及其响应函数
  getEvents() {
    return {
      "node:dblclick": "onClick",
      keydown: "onKeydown",
      "canvas:click": "onCanvasClick"
    };
  },
  onKeydown(ev: any) {
    let { key } = ev;
    if (key === "Enter" && this.input && this.lableTarget && this.group) {
      this.onCanvasClick(ev);
    }
  },
  onCanvasClick(ev: any) {
    if (this.item) {
      const graph = this.graph;
      const autoPaint = graph.get("autoPaint");
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
    let rex = new RegExp("node-label");
    return rex.test(ev.target._attrs.class);
  },
  onClick: function(ev: any) {
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
      this.graph.paint();
    }
  },
  _createInput(ev: any) {
    const self = this;
    let { item, target } = ev;
    let canvas = self.graph.get("canvas");
    let group = canvas.addGroup({
      id: "canvas-input-group"
    });
    const html = G6.Util.createDom(
      '<input class="canvas-input" autofocus="autofocus" value="new label"></input>'
    );
    html.value = item.getModel().label;
    this.inputEl = html;
    this.group = group;

    let itemBox = item.getBBox();
    const bbox = target.getBBox();
    const input = group.addShape("dom", {
      attrs: {
        x: itemBox.x,
        y: itemBox.y + bbox.y,
        width: itemBox.width,
        height: 40,
        html
      }
    });
    this.input = input;
    return input;
  }
});
