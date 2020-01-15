import G6 from "@antv/g6";
import { graph } from "@/index";
export let KeyCache: Array<any> = [];

/*graph.on("keydown", (ev: any) => {
  console.log(ev);
  /!*  if (ev.shiftKey && !KeyCache.includes("Shift")) {
        let key = "Shift" as string;
        KeyCache = KeyCache.concat(["Shift"]);
      }*!/
});*/
/*document.addEventListener("keyup", event => {
  keyMode = [];
});*/

G6.registerBehavior("key-cache", {
  // 设定该自定义行为需要监听的事件及其响应函数
  getEvents() {
    return {
      keydown: "onKeydown",
      keyup: "onKeyup"
    };
  },
  onKeydown(ev: any) {
    let { key } = ev;
    let keyCache = graph.get("keyCache") as Array<string>;
    if (keyCache && !keyCache.includes(key)) {
      keyCache.push(key);
    }
    graph.set("keyCache", keyCache);
  },
  onKeyup(ev: any) {
    graph.set("keyCache", []);
  }
});
