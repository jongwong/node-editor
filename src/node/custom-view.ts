import G6 from "@antv/g6";
import { cloneDeep } from "lodash";
G6.registerNode(
  "custom-view",
  {
    options: {
      label: "view",
      // 鼠标 hover 状态下的配置
      color: "blue",

      anchorPoints: [
        /*  [0, 0.5],*/
        [1, 0.5]
      ],
      anchorStyle: {
        fill: "#4498b6",
        class: "anchor"
      },
      size: [70, 30],
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
    draw(cfg: any, group: any) {
      const size = cfg.size || this.options.size;
      const shape = group.addShape("rect", {
        attrs: {
          x: 0, // 居中
          y: 0,
          width: size[0],
          height: size[1],
          radius: 4,
          fill: "#404040",
          shadowOffsetX: 2,
          shadowOffsetY: 2,
          shadowColor: "#333333",
          shadowBlur: 2
        }
      });

      // 如果有文本
      // 如果需要复杂的文本配置项，可以通过 labeCfg 传入
      // const style = (cfg.labelCfg && cfg.labelCfg.style) || {};
      // style.text = cfg.label;
      let label = cfg.label || this.options.label || "";
      group.addShape("text", {
        // attrs: style
        attrs: {
          x: size[0] / 2, // 居中
          y: 0 - 20,
          textAlign: "center",
          textBaseline: "middle",
          text: label,
          fill: "#e4e4e4",
          class: "node-label"
        }
      });

      group.addShape("text", {
        attrs: {
          x: size[0] / 2,
          y: size[1] / 2,
          fontFamily: "iconfont", // 对应css里面的font-family: "iconfont";
          textAlign: "center",
          textBaseline: "middle",
          text: "\ue600",
          fontSize: Math.abs(size[1] * 0.8),
          class: "graph-view"
        }
      });
      this.drawAnchorPoint(cfg, group);

      return shape;
    },
    drawAnchorPoint(cfg: any, group: any) {
      function getR(size: any) {
        let minSize;
        if (size[0] < size[1]) {
          minSize = size[0];
        } else {
          minSize = size[1];
        }
        return minSize * 0.075;
      }
      const size = cfg.size || this.options.size;
      let anchorPoints = cfg.anchorPoints || this.options.anchorPoints;
      if (anchorPoints) {
        let anchorStyle =
          cfg.anchorStyle || cloneDeep(this.options.anchorStyle);
        anchorPoints.forEach((item: any) => {
          group.addShape("circle", {
            attrs: Object.assign(anchorStyle, {
              x: item[0] * size[0],
              y: item[1] * size[1],
              r: 3.5
            })
          });
        });
      }
    }
  },
  " single-shape "
);
