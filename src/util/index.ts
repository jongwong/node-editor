import { graph } from "@/index";

export const isAnchor = (ev: any) => {
  const getClassName = (target: any) => {
    if (target._attrs && target._attrs.class) {
      return target._attrs.class;
    } else {
      return undefined;
    }
  };
  const { target } = ev;
  const targetName = getClassName(target);
  if (targetName == "anchor") return true;
  else return false;
};

export const formatData = function(data: any) {
  data.nodes.forEach((node: any) => {
    node.anchorText.forEach((item: any) => {});
  });
};
