/**
 * Created by aaron on 6/2/15.
 */

Navgraph = function (initialData, options){
    var ng = this;

    ng.svg = d3.select("body").append("svg")
        .attr("class", "nav_container")


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
                break;
            case "topLeft":
                ng.svg.attr("viewBox", "0 0 500 500")
                    .attr("preserveAspectRatio", "xMinYMin");
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
        nodes.forEach(function(d) { d.y = d.depth * 80; });

        var nodeSelection = ng.svg.selectAll(".node")
            .data(nodes, function(d) { return d.id || (d.id = ++ng.i); });

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
            //.on("click", ng.linkClick)
            .append("path")
            .attr("id", function(d) { return d.id || (d.id = ++ng.i); })

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
                var parentPos = {x: d.source.x, y: d.source.y};
                return ng.diagonal({source: parentPos, target: parentPos})
            })

        nodeSelection.exit().remove();

        // todo check ng
        //d3.select(self.frameElement).style("height", ng.diameter - 150 + "px");
    };

    ng.toggle = function(d){
        // do the rest on the node at end of clicked link
        var d = d.target;
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

    ng.collapseToDepth0 = function(){
        ng.data.children.forEach(function(node){
                node._children = node.children;
                node.children = null;
            });
        ng.update(ng.data)
    }

    ng.setup(options);
    ng.update(ng.data);
};
