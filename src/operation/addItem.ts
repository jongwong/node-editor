import {graph} from "@/index";


export const addNode = (model: any) => {
    graph.addItem('node' ,model)
};
(window as any)['addNode'] = addNode;
