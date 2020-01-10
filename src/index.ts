import G6, {NodeConfig} from "@antv/g6";
import {v4} from 'uuid'

import {cloneDeep} from 'lodash'
const data = {
    nodes: [
        {
            id: "node1",
            label: "node 1",
            x: 150,
            y: 150,
            data: {
                input: [],
                output: [
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
            data: {
                input: []
                ,
                output: [
                    'p2',
                    'v2']
            },
            shape: 'diamond'
        },
        {
            id: "node3",
            label: "node 3",
            x: 400,
            y: 300,
            data: {
                input: []
                ,
                output: [
                    'p2',
                    'v2']
            },
            shape: 'diamond'
        }
    ]
};

const min = Math.min;
const max = Math.max;
const abs = Math.abs;


let keyMode: Array<any> = [];
document.addEventListener('keydown',(event) => {
    if(event.shiftKey && !keyMode.includes('shift')){
        let key = 'shift' as string;
        keyMode = keyMode.concat(['shift']);
    }

});
document.addEventListener('keyup',(event) => {
    keyMode = []
});

let KEY_MAPPING = {
    'multilSelect': 'shift'
};

G6.registerNode('diamond', {
    options: {
        // 鼠标 hover 状态下的配置
        color: 'blue',

        anchorPoints: [[0, 0.5], [1, 0.5]],
        anchorStyle: {
            fill: '#4498b6',
            class: 'anchor'
        },
        size: [150, 40],
        stateStyles: {

            hover: {
                fill: '#555555'
            },
            // 选中节点状态下的配置
            selected: {
                fill: 'red'
            }
        }
    },
    draw(cfg: any, group: any) {
        const size = cfg.size || this.options.size;
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
        this.drawAnchorPoint(cfg, group);
        if (cfg.label) { // 如果有文本
            // 如果需要复杂的文本配置项，可以通过 labeCfg 传入
            // const style = (cfg.labelCfg && cfg.labelCfg.style) || {};
            // style.text = cfg.label;
            group.addShape('text', {
                // attrs: style
                attrs: {
                    x: (size[0] / 2), // 居中
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
    drawAnchorPoint(cfg: any, group: any) {
        function getR(size: any) {
            let minSize;
            if (size[0] < size[1]) {
                minSize = size[0]
            } else {
                minSize = size[1]
            }
            return minSize * 0.075;
        }
        const size = cfg.size || this.options.size;
        let  anchorPoints = cfg.anchorPoints || this.options.anchorPoints;
        if (anchorPoints) {
            let anchorStyle = cfg.anchorStyle || cloneDeep(this.options.anchorStyle);
            anchorPoints.forEach((item: any) => {
                group.addShape('circle', {
                    attrs: Object.assign(anchorStyle, {
                        x: item[0] * size[0],
                        y: item[1] * size[1],
                        r: 3.5
                    })
                });

            })
        }

    },
},' single-shape ');


G6.registerBehavior('custom-node-select', {
    // 设定该自定义行为需要监听的事件及其响应函数
    getEvents() {
        return {
            'node:click': 'onClick',
            'canvas:click': 'onCanvasClick',
        };
    },
    nodeCache: [],
    onCanvasClick(ev: any) {
        if(this.nodeCache.length > 0){
            this.nodeCache.forEach((node: any) => {
                this.clearState(node)
            });
        }
        this.nodeCache = [];
    },
    clearState(item:any){
        graph.clearItemStates(item, 'selected');
    },

    onClick(ev: any) {
        ev.preventDefault();

        if (!this.shouldUpdate.call(this, ev)) {
            return;
        }
        const {item} = ev;

        const state = item.hasState('selected');
        if(keyMode.includes('shift')) {
            this.nodeCache.push(item);
            if(state) {
                this.clearState(item)
            }else {
                graph.setItemState(item, 'selected', true);
            }

        } else {

            if(this.nodeCache.length > 0){
                this.nodeCache.forEach((node: any) => {
                    this.clearState(node)
                });
            }
            this.nodeCache = [];
            this.nodeCache.push(item);
            if(state) {
                this.clearState(item)
            }else {
                graph.setItemState(item, 'selected', true);
            }

        }

    }

});
G6.registerBehavior('custom-node-hover', {
    // 设定该自定义行为需要监听的事件及其响应函数
    getEvents() {
        return {
            'mouseenter': 'onMouseenter',
            'mouseleave': 'onMouseleave'
        };
    },
    nodeCache: {
        node: null,
        dx: null,
        dy: null
    },
    onMouseenter(ev: any) {

    },
    onMouseleave(ev: any) {

    }

});
G6.registerBehavior('custom-node-drag', {
    // 设定该自定义行为需要监听的事件及其响应函数
    getEvents() {
        return {
            'node:dragstart': 'onDragStart',
            'node:drag': 'onDrag',
            'node:dragend': 'onDragEnd',
        };
    },
    nodeCache: {
        node: null,
        dx: null,
        dy: null
    },
    onDragStart(ev: any) {
        if (isAnchor(ev)) return;
        const {item} = ev;
        const model = item.getModel();
        this.nodeCache.node = item;
        this.nodeCache.dx = model.x - ev.x;
        this.nodeCache.dy = model.y - ev.y;
    },
    onDrag(ev: any) {
        this.nodeCache.node && graph.update(this.nodeCache.node, {
            x: ev.x+ this.nodeCache.dx,
            y: ev.y+ this.nodeCache.dy
        });
    },
    onDragEnd(ev: any) {
        this.nodeCache.node = undefined;
    }

});


const isAnchor = (ev: any) => {
    const getClassName = (target: any) => {
        if (target._attrs && target._attrs.class) {
            return target._attrs.class
        } else {
            return undefined
        }
    };
    const {target} = ev;
    const targetName = getClassName(target);
    if (targetName == 'anchor') return true;
    else return false;
}


G6.registerBehavior('custom-brush-select', {
    // 设定该自定义行为需要监听的事件及其响应函数
    brushStyle: {
        fill: '#EEF6FF',
        fillOpacity: 0.4,
        stroke: '#DDEEFE',
        lineWidth: 1
    },
    getEvents() {
        return {
            'canvas:mousedown': 'onMousedown',
            mousemove: 'onMousemove',
            mouseup: 'onMouseup',
            'canvas:click': 'clearStates'
        };
    },
    clearStates(ev: any) {
        const graph = this.graph;
        const autoPaint = graph.get('autoPaint');
        graph.setAutoPaint(false);
        const selectedState = this.selectedState;

        const nodes = graph.findAllByState('node', selectedState);
        const edges = graph.findAllByState('edge', selectedState);
        nodes.forEach((node: any) => graph.setItemState(node, selectedState, false));
        edges.forEach((edge: any) => graph.setItemState(edge, selectedState, false));

        this.selectedNodes = [];

        this.selectedEdges = [];
        this.onDeselect && this.onDeselect(this.selectedNodes, this.selectedEdges);
        graph.emit('nodeselectchange', { targets: {
                nodes: [],
                edges: []
            }, select: false });
        graph.paint();
        graph.setAutoPaint(autoPaint);
    },

    onMousedown(ev: any) {
        const { item } = ev;
        if (item) {
            return;
        }

        if (this.selectedNodes && this.selectedNodes.length !== 0) {
            this.clearStates();
        }

        let brush = this.brush;
        if (!brush) {
            brush = this._createBrush();
        }
        this.originPoint = { x: ev.canvasX, y: ev.canvasY };
        brush.attr({ width: 0, height: 0 });
        brush.show();
        this.dragging = true;
    },
    _createBrush() {
        const self = this;
        const brush = self.graph.get('canvas').addShape('rect', {
            attrs: self.brushStyle,
            capture: false
        });
        this.brush = brush;
        return brush;
    },
    _updateBrush(ex: any) {
        const originPoint = this.originPoint;
        this.brush.attr({
            width: abs(ex.canvasX - originPoint.x),
            height: abs(ex.canvasY - originPoint.y),
            x: min(ex.canvasX, originPoint.x),
            y: min(ex.canvasY, originPoint.y)
        });
    },

    onMousemove(ev: any) {
        if (!this.dragging) {
            return;
        }
        this._updateBrush(ev);
        this.graph.paint();
    },
    onMouseup(ev: any) {
        if (!this.brush && !this.dragging) {
            return;
        }
        const graph = this.graph;
        const autoPaint = graph.get('autoPaint');
        graph.setAutoPaint(false);
        this.brush.destroy();
        this.brush = null;
        this._getSelectedNodes(ev);
        this.dragging = false;
        this.graph.paint();
        graph.setAutoPaint(autoPaint);

    },
    _getSelectedNodes(e: any) {
        const graph = this.graph;
        const state = this.selectedState;
        const originPoint = this.originPoint;
        const p1 = { x: e.x, y: e.y };
        const p2 = graph.getPointByCanvas(originPoint.x, originPoint.y);
        const left = min(p1.x, p2.x);
        const right = max(p1.x, p2.x);
        const top = min(p1.y, p2.y);
        const bottom = max(p1.y, p2.y);
        const selectedNodes: Array<any> = [];
        const shouldUpdate = this.shouldUpdate;
        const selectedIds:Array<any> = [];
        graph.getNodes().forEach((node: any) => {
            const bbox = node.getBBox();
            if (bbox.centerX >= left
                && bbox.centerX <= right
                && bbox.centerY >= top
                && bbox.centerY <= bottom
            ) {
                if (shouldUpdate(node, 'select')) {
                    selectedNodes.push(node);
                    const model = node.getModel();
                    selectedIds.push(model.id);
                    graph.setItemState(node, state, true);
                }
            }
        });

        const selectedEdges: Array<any> = [];
        if (this.includeEdges) {
            // 选中边，边的source和target都在选中的节点中时才选中
            selectedNodes.forEach(node => {
                const edges = node.getEdges();
                edges.forEach((edge: any) => {
                    const model = edge.getModel();
                    const { source, target } = model;
                    if (selectedIds.includes(source)
                        && selectedIds.includes(target)
                        && shouldUpdate(edge, 'select')) {
                        selectedEdges.push(edge);
                        graph.setItemState(edge, this.selectedState, true);
                    }
                });
            });
        }

        this.selectedEdges = selectedEdges;
        this.selectedNodes = selectedNodes;
        this.onSelect && this.onSelect(selectedNodes, selectedEdges);
        graph.emit('nodeselectchange', { targets: {
                nodes: selectedNodes,
                edges: selectedEdges
            }, select: true });
    },

});


G6.registerBehavior('custom-node-link', {
    // 设定该自定义行为需要监听的事件及其响应函数
    getEvents() {
        return {
            'node:mousedown': 'onMousedown',
            mousemove: 'onMousemove',
            mouseup: 'onMouseup',
        };
    },
    addEdgeCheck(ev: any, inFlag = undefined) {
        const {graph} = this;
        const linkRule = graph.get('defaultEdge').linkRule;
        // 如果点击的不是锚点就结束
        if (!isAnchor(ev)) return false;
        // 出入度检查
        // return checkOutAndInEdge(ev.item as Node, inFlag, linkRule);
        return true
    },
    notSelf(ev: any) {
        /*        const node = ev.item;
                const model = node.getModel();
                if (this.edge.getSource().get('id') === model.id) return false;*/
        return true;
    },
    onMousedown(ev: any) {
        const {edgeType} = this;
        if (!this.addEdgeCheck.call(this, ev, 'out')) return;
        const node = ev.item;
        const graph = this.graph;
        const linkRule = graph.get('defaultEdge').linkRule;
        this.sourceNode = node;
        const point = {x: ev.x, y: ev.y};
        const model = node.getModel();
        let sourcePoint = node.getLinkPoint(point);
        if (!this.addingEdge && !this.edge) {
            const item = {
                id: v4() + '',
                source: model.id,
                target: point,
                sourceAnchor: sourcePoint.index
            };
            this.edge = graph.addItem('edge', item);
            this.addingEdge = true;
        }
    },


    onMousemove(ev: any) {
        const {graph} = this;
        if (this.addingEdge && this.edge) {
            const point = {x: ev.x, y: ev.y};
            // 鼠标放置到一个锚点上时，更新边
            // 否则只更新线的终点位置
            if (this.addEdgeCheck.call(this, ev, 'in') && this.notSelf(ev)) {
                const node = ev.item;
                const model = node.getModel();
                graph.updateItem(this.edge, {
                    targetAnchor: ev.target.get('index'),
                    target: model.id,
                });
            } else graph.updateItem(this.edge, {target: point});
        }
    },
    // 两个节点之间，相同方向的线条只允许连一条
    isOnlyOneEdge(node: any) {
        return true
        // if (this.allowMultiEdge) return true;
        // const source = this.edge.getSource().get('id');
        // const target = node.get('id');
        // if (!source || !target) return true;
        // return !node.getEdges().some((edge: any) => {
        //     const sourceId = edge.getSource().get('id');
        //     const targetId = edge.getTarget().get('id');
        //     if (sourceId === source && targetId === target) return true;
        //     else false;
        // });
    },

    onMouseup(ev: any) {
        const {graph, sourceNode} = this;
        const node = ev.item as G6.Node;
        // 隐藏所有节点的锚点
        const hideAnchors = () => {
            graph.setAutoPaint(false);
            graph.getNodes().forEach((n: any) => {
                // 清楚所有节点状态
                n.clearStates('addingEdge');
                n.clearStates('limitLink');
                n.clearStates('addingSource');
            });
            graph.refreshItem(sourceNode);
            graph.paint();
            graph.setAutoPaint(true);
        };

        const removEdge = () => {
            graph.removeItem(this.edge);
            this.edge = null;
            this.addingEdge = false;
        };
        if (!this.addEdgeCheck.call(this, ev, 'in')) {
            if (this.edge && this.addingEdge) {
                removEdge();
                hideAnchors();
            }
            return;
        }

        const model = node.getModel();
        if (this.addingEdge && this.edge) {
            // 禁止自己连自己
            if (!this.notSelf(ev) || !this.isOnlyOneEdge(node)) {
                removEdge();
                hideAnchors();
                return;
            }


            const point = {x: ev.x, y: ev.y};
            let targetPoint = node.getLinkPoint(point) as any;
            graph.setItemState(this.edge, 'drag', false);
            graph.updateItem(this.edge, {
                targetAnchor: targetPoint.index,
                target: model.id,
            });
            this.edge = null;
            this.addingEdge = false;


            /*  hideAnchors();*/
        }
    },

});


const graph = new G6.Graph({
    container: "container",
    width: 1200,
    height: 1200,
    renderer: 'svg',
    modes: {
        default: [
            {
                type: 'custom-node-drag'
            },
            {
                type: 'custom-node-link'
            },
            {
                type:'custom-brush-select'
            },
            {
                type: 'custom-node-select'
            }
        ]
    },
    defaultEdge: {
        // ... 其他属性
        style: {
            stroke: '#698652',
            lineWidth: 1,
            // ... 其他属性
        }
    }

});
/*graph.on('node:mouseenter', evt => {
    const { item } = evt;
    graph.setItemState(item, 'hover', true);
});
graph.on('node:mouseleave', evt => {
    const { item } = evt;
    graph.clearItemStates(item, 'hover')
});*/
graph.data(data);
graph.render();

export const getkeyCode = (keyName: string) => {
    switch (keyName) {
        case 'shift':
            return '';
        break;
    }
};
