import G6, {NodeConfig} from "@antv/g6";

const data = {
    nodes: [
        {
            id: "node1",
            label: "node 1",
            x: 150,
            y: 150,
            model:{
                input:[],
                output:[
                    'p1',
                    'v1'
                ]
            },
            shape: 'diamond'
        },
        {
            id: "node2",
            label: "node 2",
            x: 400,
            y: 150,
            model:{
                input:[]
                ,
                output:[
                    'p2',
                    'v2'  ]
            },
            shape: 'diamond'
        }
    ]
};

const graph = new G6.Graph({
    container: "container",
    width: 1200,
    height: 1200,
    renderer: 'svg',
    modes: {
        default: [
            {
                type: 'drag-node',
                enableDelegate: true
            },
            {
                type: 'test'
            }
        ]
    }

});



const DefaultOptions = {
    color: 'blue',
    size: [150,40],
    anchorPoints:[[0,0.5], [1,0.5]],
    anchorStyle: {
        fill: '#4498b6'
    }
};






G6.registerNode('diamond', {
    draw(cfg: any, group: any) {
        let defalutOptions = DefaultOptions;
        cfg = Object.assign(defalutOptions,cfg);
        // 如果 cfg 中定义了 style 需要同这里的属性进行融合
     /*   const shape = group.addShape('path', {
            attrs: {
                path: this.getPath(cfg), // 根据配置获取路径
                stroke: cfg.color // 颜色应用到边上，如果应用到填充，则使用 fill: cfg.color
            }
        });*/
        const size = cfg.size;
        const shape = group.addShape('rect', {
            attrs: {
                x: 0, // 居中
                y: 0,
                width: size[0],
                height: size[1],
                radius: 4,
                fill: '#404040',
                shadowOffsetX: 2,
                shadowOffsetY: 2,
                shadowColor: '#333333',
                shadowBlur: 2,
            }
        });
        this.drawAnchorPoint(cfg,group);
        if(cfg.label) { // 如果有文本
            // 如果需要复杂的文本配置项，可以通过 labeCfg 传入
            // const style = (cfg.labelCfg && cfg.labelCfg.style) || {};
            // style.text = cfg.label;
            group.addShape('text', {
                // attrs: style
                attrs: {
                    x: 0 + size[0] / 2, // 居中
                    y: 0 - 20,
                    textAlign: 'center',
                    textBaseline: 'middle',
                    text: cfg.label,
                    fill: '#e4e4e4'
                }
            });
        }
        return shape;
    },
    // 返回菱形的路径
    drawAnchorPoint(cfg: any,group: any) {
        function getR(size: any) {
            let minSize;
            if(cfg.size[0] < cfg.size[1]){
                minSize = size[0]
            } else {
                minSize = size[1]
            }
            return minSize * 0.075;
        }
        if(cfg.anchorPoints) {
            cfg.anchorPoints.forEach((item: any) => {
                group.addShape('circle', {
                    attrs: Object.assign(cfg.anchorStyle,{
                        x: item[0] * cfg.size[0],
                        y: item[1] * cfg.size[1],
                        r: 3.5
                    })
                });

            })
        }

    },
});


G6.registerBehavior('test', {
    // 设定该自定义行为需要监听的事件及其响应函数
    getEvents() {
    debugger
        return {
            'node:click': 'onNodeClick' ,   // 监听事件 node:click，响应函数时 onClick
        };
    },
    // getEvents 中定义的 'node:click' 的响应函数
    onNodeClick(e:any) {
    debugger

    },
    // getEvents 中定义的 mousemove 的响应函数
    onCanvasClick(ev: any) {
    debugger
    },
    // getEvents 中定义的 'edge:click' 的响应函数
    removeNodesState(ev: any) {
    debugger
    }
});
/*graph.on('node:click', ev => {
    debugger
    const shape = ev.target;
    const node = ev.item;
});*/

graph.data(data);
graph.render();
