import G6 from "@antv/g6";
import { cloneDeep } from "lodash";
import { graph } from "@/index";

G6.registerNode(
  "custom-node",
  {
    options: {
      // 鼠标 hover 状态下的配置
      color: "blue",
      lineHeight: 20,
      anchorStyle: {
        fill: "#4498b6",
        class: "anchor"
      },
      size: [150, 20],
      anchorText: {
        in: [{ name: "IN" }],
        out: [{ name: "OUT" }]
      },

      stateStyles: {
        hover: {
          fill: "#555555"
        },
        // 选中节点状态下的配置
        selected: {
          fill: "#537977",
          opacity: "0.3"
        }
      }
    },
    getDefaultCfg() {
      return this.options;
    },
    draw(cfg: any, group: any) {
      this.group = group;
      const size = cfg.size || this.options.size;
      let line = 0;
      let lineHeight = cfg.lineHeight || this.options.lineHeight;
      let anchorText = cfg.anchorText || this.options.anchorText;
      try {
        line = Math.max(anchorText.in.length, anchorText.out.length);
      } catch (e) {}
      const shape = group.addShape("rect", {
        attrs: {
          x: 0, // 居中
          y: 0,
          width: size[0],
          height: size[1] + line * lineHeight,
          radius: 4,
          fill: "#404040",
          shadowOffsetX: 2,
          shadowOffsetY: 2,
          shadowColor: "#333333",
          shadowBlur: 2
        }
      });
      if (cfg.label) {
        group.addShape("text", {
          // attrs: style
          attrs: {
            x: size[0] / 2, // 居中
            y: 0 - 20,
            textAlign: "center",
            textBaseline: "middle",
            text: cfg.label,
            fill: "#e4e4e4",
            class: "node-label"
          }
        });
      }
      let inAndOutGroup = group.addGroup();
      if (anchorText) {
        if (line) {
          inAndOutGroup.addShape("rect", {
            attrs: {
              x: 0, // 居中
              y: size[1] / 2 + line,
              width: size[0],
              height: line * lineHeight,
              class: "anchor-group"
            }
          });
        }
      }

      if (cfg.icon) {
        let fontSize = Math.abs(size[1] * 0.7);
        group.addShape("text", {
          attrs: {
            x: size[0] / 2 - fontSize / 4,
            y: (size[1] + line * lineHeight) / 2,
            fontFamily: "iconfont", // 对应css里面的font-family: "iconfont";
            textAlign: "center",
            textBaseline: "middle",
            text: cfg.icon,
            fontSize: fontSize,
            class: "graph-node-icon"
          }
        });
      }

      this.drawAnchorPoint(cfg, group);

      return shape;
    },

    setState(name: any, value: any, item: any) {
      const keyShape = item.getKeyShape();
      let originStyle = item.getOriginStyle();
      let stateStyle = this.options.stateStyles[name];

      if (value) {
        keyShape.attr(stateStyle);
      } else if (value === false) {
        let temp = "";
        try {
          let itemClass = keyShape._attr.class;
          temp = itemClass.replace(this.options[name].class, "");
        } catch (e) {}
        keyShape.attr(Object.assign(originStyle, { class: temp }));
      }
    },
    update(cfg: any, node: any) {
      const group = node.getContainer(); // 获取容器
      const shape = group.get("children")[1]; // 按照添加的顺序
      const size = cfg.size || this.options.size;
      shape.attr({
        x: size[0] / 2, // 居中
        y: 0 - 20,
        textAlign: "center",
        textBaseline: "middle",
        text: cfg.label,
        fill: "#e4e4e4",
        class: "node-label"
      });
    },
    getAnchorPoints: function(cfg: any) {
      let anchorText = cfg.anchorText || this.options.anchorText;
      const size = cfg.size || this.options.size;
      let lineHeight = cfg.lineHeight || this.options.lineHeight;
      let temp: Array<any> = [];
      if (anchorText && anchorText.in && anchorText.out) {
        let line = Math.max(anchorText.in.length, anchorText.out.length);
        let anchorIn = anchorText.in;
        let anchorOut = anchorText.out;
        for (let i = 0; i < line; i++) {
          if (i < anchorIn.length) {
            let y1 =
              (size[1] / 2 + (i + 0.5) * lineHeight) /
              (size[1] + lineHeight * line);
            temp.push([0, y1]);
          }
          if (i < anchorOut.length) {
            let y2 =
              (size[1] / 2 + (i + 0.5) * lineHeight) /
              (size[1] + lineHeight * line);
            temp.push([1, y2]);
          }
        }
        return temp;
      } else {
        return [
          [0, 0.5], // 左侧中间
          [1, 0.5] // 右侧中间
        ];
      }
    },
    drawAnchorPoint(cfg: any, group: any) {
      function getR(size: any) {
        let minSize = Math.min(size[0], size[1]);
        return minSize * 0.075;
      }
      const size = cfg.size || this.options.size;
      let anchorText = cfg.anchorText || this.options.anchorText;
      if (anchorText) {
        let lineHeight = cfg.lineHeight || this.options.lineHeight;
        let anchorStyle =
          cfg.anchorStyle || cloneDeep(this.options.anchorStyle);
        anchorText.in.forEach((item: any, index: any) => {
          let anchorGroup = group.addGroup();
          anchorGroup.addShape("circle", {
            attrs: Object.assign(anchorStyle, {
              x: 5,
              y: size[1] / 2 + (index + 0.5) * lineHeight,
              r: 3.5
            })
          });
          anchorGroup.addShape("text", {
            // attrs: style
            attrs: {
              x: 15, // 居中
              y: size[1] / 2 + (index + 0.5) * lineHeight,
              textBaseline: "middle",
              text: item.name,
              class: "anchor-label"
            }
          });
        });
        anchorText.out.forEach((item: any, index: any) => {
          let anchorGroup = group.addGroup();
          let anchorShape = anchorGroup.addShape("circle", {
            attrs: Object.assign(anchorStyle, {
              x: size[0] - 5,
              y: size[1] / 2 + (index + 0.5) * lineHeight,
              r: 3.5
            })
          });
          let text = anchorGroup.addShape("text", {
            // attrs: style
            attrs: {
              x: 0, // 居中
              y: size[1] / 2 + (index + 0.5) * lineHeight,
              textBaseline: "middle",
              text: item.name,
              class: "anchor-label"
            }
          });
          let textWidth = text.getBBox().maxX + 9;
          text.attr({ x: size[0] - textWidth });
        });
      }
    }
  },
  " single-shape "
);
