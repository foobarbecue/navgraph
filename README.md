This is a pretty menu for a website. See examples/botw.html for usage.

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