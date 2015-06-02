/**
 * Created by aaron on 6/2/15.
 */

navgraph = function (initialData, options){
    var ng = this;

    ng._diameter = 800 || options.diameter;

    ng.set_diameter = function(new_diameter){
        ng._diameter = new_diameter;
        ng.update_data(initialData);
        ng.draw();
    };

    ng.svg = d3.select("body").append("svg")
        .attr("class", "nav_container")
        .attr("width", ng._diameter)
        .attr("height", ng._diameter)
        .append("g")
        .attr("transform", "translate(0," + ng._diameter + ")");

    ng.tree = d3.layout.tree()
        .size([90, ng._diameter / 2 - 120])
        .separation(function (a, b) {
            return (a.parent == b.parent ? 1 : 2) / a.depth;
        });

    ng.diagonal = d3.svg.diagonal.radial()
        .projection(function (d) {
            return [d.y, d.x / 180 * Math.PI];
        });


    ng.update_data = function(nodeData) {
        ng.nodes = ng.tree.nodes(nodeData);
        ng.links = ng.tree.links(ng.nodes);
        ng.linkSelection = ng.svg.selectAll(".link")
            .data(ng.links);
        ng.nodeSelection = ng.svg.selectAll(".node")
            .data(ng.nodes, function(d){return d.name})
    };

    ng.draw = function(){
        ng.linkSelection
            .enter().append("path")
            .attr("class", "link")
            .attr("d", ng.diagonal);

        ng.nodeGroups = ng.nodeSelection
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function (d) {
                return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
            })
            .on('click', ng.nodeClick);

        ng.nodeGroups
            .append("text")
            .attr("dy", ".31em")
            // Only the last-level text should be "outside"
            .attr("text-anchor", function (d) {
                return d.children ? "end" : "start";
            })
            .attr("transform", function (d) {
                return d.x < 180 ? "translate(8)" : "rotate(180)";
            })
            .text(function (d) {
                return d.name;
            });

        ng.nodeGroups
            .append("circle")
            .attr("r", 2);

        ng.linkSelection.exit().remove();

        ng.nodeSelection.exit().remove();

        // todo check ng
        //d3.select(self.frameElement).style("height", ng.diameter - 150 + "px");
    };

    ng.nodeClick = function(d){
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        };
        ng.update_data(d);
        ng.draw();
    };


    ng.update = function(nodeData) {
        ng.update_data(nodeData);
        ng.draw();
    };

    ng.reset = function(){ng.update(initialData, options)};

    ng.reset();
};
