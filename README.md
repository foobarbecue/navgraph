This is a pretty menu for a website.

# Installation
```
npm install navgraph
```
Or, clone this repository, and then
```
cd navgraph
npm update
```

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