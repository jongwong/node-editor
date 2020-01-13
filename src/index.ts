import G6, { NodeConfig } from "@antv/g6";

import "./behavior";
import "./node/custom-node";
import "./node/custom-edge";

import "./operation/addItem";
import { addNode } from "@/operation/addItem";
import "./behavior/node-lable-edit";

const data = {
  nodes: [
    {
      id: "node1",
      label: "node 1",
      x: 125,
      y: 253,
      data: { input: [], output: ["p1", "v1"] },
      shape: "custom-node"
    },
    {
      id: "node2",
      label: "node 2",
      x: 400,
      y: 150,
      data: { input: [], output: ["p2", "v2"] },
      shape: "custom-node"
    },
    {
      id: "node3",
      label: "node 3",
      x: 393,
      y: 378,
      data: { input: [], output: ["p2", "v2"] },
      shape: "custom-node"
    },
    {
      id: "node6",
      label: "node 6",
      x: 655,
      y: 382,
      data: { input: [], output: ["p1", "v1"] },
      shape: "custom-node"
    },
    {
      id: "node5",
      label: "node 5",
      x: 650,
      y: 224,
      data: { input: [], output: ["p1", "v1"] },
      shape: "custom-node"
    },
    {
      id: "node4",
      label: "node 4",
      x: 647,
      y: 58,
      data: { input: [], output: ["p1", "v1"] },
      shape: "custom-node"
    }
  ],
  edges: [
    {
      id: "8e4f1536-a4dc-430a-b7f4-440bf7f18508",
      source: "node1",
      target: "node2",
      sourceAnchor: 1,
      shape: "custom-edge",
      startPoint: { x: 275.5, y: 273, index: 1 },
      endPoint: { x: 399.5, y: 170, index: 0, anchorIndex: 0 },
      targetAnchor: 0
    },
    {
      id: "c9412a4e-1e3c-4f01-a5b8-8fe55ae2a2f0",
      source: "node1",
      target: "node3",
      sourceAnchor: 1,
      shape: "custom-edge",
      startPoint: { x: 275.5, y: 273, index: 1 },
      endPoint: { x: 392.5, y: 398, index: 0 },
      targetAnchor: 0
    },
    {
      id: "46fe957c-d685-4094-81d8-b7b1165d6eda",
      source: "node3",
      target: "node6",
      sourceAnchor: 1,
      shape: "custom-edge",
      startPoint: { x: 543.5, y: 398, index: 1 },
      endPoint: { x: 654.5, y: 402, index: 0 },
      targetAnchor: 0
    },
    {
      id: "4ef83303-5c93-4d71-8f27-cbdff119d1ca",
      source: "node2",
      target: "node4",
      sourceAnchor: 1,
      shape: "custom-edge",
      startPoint: { x: 550.5, y: 170, index: 1, anchorIndex: 1 },
      endPoint: { x: 646.5, y: 78, index: 0 },
      targetAnchor: 0
    },
    {
      id: "f69c0606-090a-440e-821d-bfbb13024348",
      source: "node2",
      target: "node5",
      sourceAnchor: 1,
      shape: "custom-edge",
      startPoint: { x: 550.5, y: 170, index: 1, anchorIndex: 1 },
      endPoint: { x: 649.5, y: 244, index: 0 },
      targetAnchor: 0
    }
  ],
  groups: []
};

export const graph = new G6.Graph({
  container: "container",
  width: 1200,
  height: 800,
  renderer: "svg",
  modes: {
    default: [
      {
        type: "custom-node-drag"
      },
      {
        type: "custom-node-link"
      },
      {
        type: "custom-brush-select"
      },
      {
        type: "custom-node-select"
      },
      {
        type: "node-lable-edit"
      }
    ]
  }
});
/*graph.on("node:mouseenter", evt => {
  const { item } = evt;
  graph.setItemState(item, "hover", true);
});
graph.on("node:mouseleave", evt => {
  const { item } = evt;
  graph.clearItemStates(item, "hover");
});*/

graph.on("node-select-change", (ev: any) => {
  //console.log(ev);
});
graph.data(data);
graph.render();

(window as any)["graph"] = graph;
