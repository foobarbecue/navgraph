/**
 * Created by aaron on 6/2/15.
 */

function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
}

Navgraph = function (initialData, options){
    var ng = this;

    var ancestors = function(obj, ancestorArray){
        // return a list of the current object, its parents, grandparents, and so on
        var ancestorArray = ancestorArray || [obj];
        if (obj.parent) {
            ancestorArray.push(obj.parent);
            ancestors(obj.parent, ancestorArray);
        } else {
            //return ancestorArray;
            return ancestorArray
        }
        return ancestorArray
    };

    ng.setup = function(options){
        ng.data = initialData;
        ng.i = 0;
        ng._diameter = options.diameter || 800;
        ng.selected = {};
        ng.selected.ancestors = [];
        ng.svg = options.nav_container ||
            d3.select("body").append("svg")
                .attr("class", "nav_container");

        // Create the title for the nav menu
        if (!!options.title) {
            ng.title = d3.select("body").append("div")
                .attr("class","nav_title " + options.title.replace(' ','_'))
                .text(options.title)

            ng.title.style({
                'font-variant':'small-caps',
                'font-size': 'large',
                'box-shadow': '0 0 10px',
                'opacity': 0.8,
                'background': 'white'
            })

            ng.svg.attr("class","navgraph " + options.title.replace(' ','_'))

        }


        switch(options.align) {
            case "bottomLeft":
                ng.svg.attr("viewBox", "0 -400 400 400")
                    .attr("preserveAspectRatio", "xMinYMax")
                    .style({
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        width: "100%",
                        "font-size": "5pt"
                    });
                ng.title.style({
                    position: 'absolute',
                    bottom: '20px',
                    left: '10px',

                });
                break;
            case "topLeft":
                ng.svg.attr("viewBox", "0 0 400 400")
                    .attr("preserveAspectRatio", "xMinYMin")
                    .style({
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        "font-size": "5pt"
                    });
                ng.title.style({
                    position: 'absolute',
                    top: '20px',
                    left: '10px',

                });
                break;
        }

        ng.tree = d3.layout.tree()
            .size([90, ng._diameter])
            .separation(function (a, b) {
                return (a.parent == b.parent ? 1 : 2) / a.depth;
            })
            .sort(function(a,b){  // TODO Performance prob. horrible
                if (ng.selected.ancestors.indexOf(a) != 0) {
                    return -1
                } else if (ng.selected.ancestors.indexOf(b) != 0){
                    return 1
                }
                else {
                    return a.name > b.name ? 1 : -1
                };
            }) //Sort alphabetically

        ng.diagonal = d3.svg.diagonal.radial()
            // reversing the paths so that I can end-align the textPath
            //.target(function(d) { return d.source})
            //.source(function(d) { return d.target})
            .projection(function (d) {
                return [d.y, d.x / 180 * Math.PI];
            });

    };

    ng.update = function(nodeData) {
        nodeData = nodeData || ng.data;
        var nodes = ng.tree.nodes(nodeData),
            links = ng.tree.links(nodes);

        // Normalize for fixed-depth.
        nodes.forEach(function(d) { d.y = d.depth * 80;
            if (options.align == 'topLeft') {
                d.x = d.x + 90
            }
        });

        var nodeSelection = ng.svg.selectAll(".node")
            .data(nodes, function(d) { return d.id || (d.id = guid()); });

        var nodeGroups = nodeSelection
            .enter().append("g")
            .attr("class", "node")

        nodeGroups
            .append("circle")
            .attr("r", 3)
            .style("fill", "none")
            .style("stroke", function(d){return d.children ? "none" : "black"});

        var linkSelection = ng.svg.selectAll(".link")
            .data(links, function(d){return d.target.id})
            .style("font-weight" , function(d){
                return d.target == ng.selected ? "bold" : "normal"
            })

        var linkGroups = linkSelection
            .enter()
            .append("g")
            .attr("class", "link")

        linkGroups
            .append("path")
            .attr("id", function(d) { return d.id || (d.id = guid()); })

        linkSelection.selectAll("g path")
            .transition()
            .duration(500)
            .attr("d", ng.diagonal)

        linkGroups
            .append("text")
            .on("click", ng.toggle)
            .append("textPath")
            .attr("xlink:href",function(d){return "#"+d.id})
            .attr("startOffset","100%")
            .text(function(d){return d.target.name})
            .style("text-anchor","end")

        // exit by squishing the path into the parent node position
        linkSelection.exit().selectAll("path").transition()
            .duration(500)
            .attr("d", function(d){
                if (d.source.x && d.source.y) {
                    var parentPos = {x: d.source.x, y: d.source.y};
                }
                else{
                    var parentPos = {x:0, y:0}
                }
                return ng.diagonal({source: parentPos, target: parentPos})
            })

        nodeSelection.exit().remove();

        if (options.toggle_on_click_title) {
            ng.title.on('click',
                function () {
                    ng.toggle(ng.data)
                }
            );
        };

        // todo check ng
        //d3.select(self.frameElement).style("height", ng.diameter - 150 + "px");
    };

    ng.toggle = function(d){
        // do the rest on the node at end of clicked link
        if (!!d.target) {
            var d = d.target
        };
        ng.selected = d;
        ng.selected.ancestors = ancestors(d);
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children || null;
            d._children = null;
        };
        ng.update(ng.data);
    };

    ng.collapseToDepth1 = function(){
        ng.data.children.forEach(function(node){
                node._children = node.children;
                node.children = null;
            });
        ng.update(ng.data);
    };

    ng.collapseToDepth0 = function(){
        ng.data._children = ng.data.children;
        ng.data.children = null;
        ng.update(ng.data);
    };

    ng.setup(options);
    ng.update(ng.data);
};

//TODO use proper export
window.Navgraph = window.Navgraph || Navgraph;