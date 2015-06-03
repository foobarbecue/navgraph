/**
 * Created by aaron on 6/2/15.
 */

navgraph = function (initialData, options){
    var ng = this;
    ng.initialData = initialData;
    ng.i = 0;
    ng._diameter = 800 || options.diameter;

    ng.set_diameter = function(new_diameter){
        ng._diameter = new_diameter;
        ng.update(initialData);
    };

    ng.svg = d3.select("body").append("svg")
        .attr("class", "nav_container")
        .attr("width", ng._diameter)
        .attr("height", ng._diameter)
        .append("g")
        .attr("transform", "translate("+ng._diameter +",0)rotate(180)");

    ng.tree = d3.layout.tree()
        .size([90, ng._diameter / 2 - 120])
        .separation(function (a, b) {
            return (a.parent == b.parent ? 1 : 2) / a.depth;
        });

    ng.diagonal = d3.svg.diagonal.radial()
        // reversing the paths so that I can end-align the textPath
        .target(function(d) { return d.source})
        .source(function(d) { return d.target})
        .projection(function (d) {
            return [d.y, d.x / 180 * Math.PI];start
        });


    ng.update = function(nodeData) {
        var nodes = ng.tree.nodes(nodeData),
            links = ng.tree.links(nodes);

        var nodeSelection = ng.svg.selectAll(".node")
            .data(nodes, function(d) { return d.id || (d.id = ++ng.i); });

        var nodeGroups = nodeSelection
            .enter().append("g")
            .attr("class", "node")

        nodeGroups
            .append("circle")
            .attr("r", 3)
            .style("fill", "none")
            .style("stroke", function(d){return d.children ? "none" : "black";})

        var linkSelection = ng.svg.selectAll(".link")
            .data(links, function(d){return d.target.id})

        var linkGroups = linkSelection.enter().append("g")
            .attr("class", "link")

        linkGroups
            //.on("click", ng.linkClick)
            .append("path")
            .attr("id", function(d) { return d.id || (d.id = ++ng.i); })

        linkSelection.selectAll("g path")
            .attr("d", ng.diagonal)

        linkGroups
            .on("click", ng.toggle)
            .append("text")
            .append("textPath")
            .attr("xlink:href",function(d){return "#"+d.id})
            .text(function(d){return d.target.name})

        linkSelection.exit().remove();

        nodeSelection.exit().remove();

        // todo check ng
        //d3.select(self.frameElement).style("height", ng.diameter - 150 + "px");
    };

    ng.toggle = function(d){
        // this is for use on links, not nodes
        var d = d.target
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            };
            ng.update(initialData);
    };
    ng.update(initialData);
};
