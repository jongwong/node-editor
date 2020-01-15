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
export let keyMode: Array<any> = [];
document.addEventListener("keydown", event => {
  if (event.shiftKey && !keyMode.includes("shift")) {
    let key = "shift" as string;
    keyMode = keyMode.concat(["shift"]);
  }
});
document.addEventListener("keyup", event => {
  keyMode = [];
});

export const formatData = function(data: any) {
  data.nodes.forEach((node: any) => {
    node.anchorText.forEach((item: any) => {});
  });
};
