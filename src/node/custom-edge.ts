import G6, { Util } from "@antv/g6";
import { cloneDeep } from "lodash";
G6.registerEdge(
  "custom-edge",
  {
    curvePosition: [1 / 2, 1 / 2],
    curveOffset: [-20, 20],
    options: {
      style: {
        stroke: "#698652",
        lineWidth: 1
        // ... 其他属性
      },
      stateStyles: {
        hover: {
          class: "graph-edge-hover"
        },
        draging: {
          class: "graph-edge-draging"
        },
        // 选中节点状态下的配置
        selected: {
          class: "graph-edge-selected"
        }
      }
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
    getControlPoints(cfg: any) {
      const { startPoint, endPoint } = cfg;
      let len1 = 30;
      if (Math.abs(endPoint.x - startPoint.x) < 60) {
        len1 = 5;
      }
      const innerPoint1 = {
        x: len1 + startPoint.x,
        y: startPoint.y
      };
      const innerPoint2 = {
        x: endPoint.x - startPoint.x - len1 + startPoint.x,
        y: endPoint.y
      };
      const controlPoints = [innerPoint1, innerPoint2];
      return controlPoints;
    },
    getPath(points: any) {
      const path = [];
      path.push(["M", points[0].x, points[0].y]);
      path.push([
        "C",
        points[1].x,
        points[1].y,
        points[2].x,
        points[2].y,
        points[3].x,
        points[3].y
      ]);
      return path;
    }
  },
  "single-line"
);
