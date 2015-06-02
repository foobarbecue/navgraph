/**
 * Created by aaron on 6/2/15.
 */

navgraph = function (initialData, options){
    var navgraph_class = this;

    this._diameter = 800 || options.diameter;

    this.set_diameter = function(new_diameter){
        this._diameter = new_diameter;
        this.update_data(initialData);
        this.draw();
    };

    var svg = d3.select("body").append("svg")
        .attr("class", "nav_container")
        .attr("width", this._diameter)
        .attr("height", this._diameter)
        .append("g")
        .attr("transform", "translate(0," + this._diameter + ")");

    this.tree = d3.layout.tree()
        .size([90, this._diameter / 2 - 120])
        .separation(function (a, b) {
            return (a.parent == b.parent ? 1 : 2) / a.depth;
        });

    this.diagonal = d3.svg.diagonal.radial()
        .projection(function (d) {
            return [d.y, d.x / 180 * Math.PI];
        });


    this.update_data = function(nodeData) {
        this.nodes = this.tree.nodes(nodeData);
        this.links = this.tree.links(this.nodes);
        this._displayedLinks = svg.selectAll(".link")
            .data(this.links);
        this._displayedNodes = svg.selectAll(".node")
            .data(this.nodes)
    };

    this.draw = function(){
        this._displayedLinks
            .enter().append("path")
            .attr("class", "link")
            .attr("d", this.diagonal);


        var nodeGroups = this._displayedNodes
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function (d) {
                return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
            })
            .on('click', this.nodeClick);

        nodeGroups
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

        nodeGroups
            .append("circle")
            .attr("r", 2);

        this._displayedLinks.exit().remove();

        this._displayedNodes.exit().remove();

        // todo check this
        //d3.select(self.frameElement).style("height", this.diameter - 150 + "px");
    };

    this.nodeClick = function(d){
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        navgraph_class.update(d);
    };


    this.update = function(nodeData) {
        this.update_data(nodeData);
        this.draw();
    };

    this.reset = this.update(initialData, options);

    this.reset();
};
