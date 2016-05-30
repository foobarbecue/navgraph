This is a pretty menu for a website.

# Installation
Clone this repository and then run "npm update" to download a local copy of d3.

# Use
There is an example with a couple of menus in examples/botw.html.

To create a navgraph:
```
mynavgraph = new navgraph(data, options);
```

Data is a nested object something like:
 
```
var data = {
    name: "foo",
    children: [
        {name:"bar"},
        {name:"baz"
         children: ...   
        }
    ]
}
```