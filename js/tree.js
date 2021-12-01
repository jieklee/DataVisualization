function tree(data, varjson) {
    var margin = {top: 0, right: 0, bottom: 20, left:30},
    width = document.getElementById("tree-area").clientWidth - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    var svg = d3.select("#tree-area").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "rects")

    svg.append("g")
        .attr("class", "texts")

    svg.append("g")
        .attr("class", "vals")

    svg.append("g")
        .attr("class", "titles")       
    treeChange(data, varjson);
}


function treeChange(data, varjson) {
    var groupvar = "Publisher";
    var opacityvar = "Review";
    var h1var = "Game Title";
    // var h2var = "Global";

    if(varjson) {
        groupvar = varjson.groupvar
        opacityvar = varjson.opacityvar
        h1var = varjson.h1var
        // h2var = varjson.h2var
    }

    var margin = {top: 0, right: 0, bottom: 20, left:30},
    width = document.getElementById("tree-area").clientWidth - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    var svg = d3.select("#tree-area")
        .select("svg")
        .select("g");

    var root = d3.nest()
        .key((d) => d[groupvar])
        .rollup((leaves) => leaves)
        .entries(data);
    
    root.forEach( obj => {
        obj["name"] = obj["key"];
        delete obj["key"];
        obj["children"] = obj["value"];
        delete obj["value"];
        // obj["colname"] = obj["name"];
    });
    root = {children:root, name: "main"};
    // console.log(root);

    var root = d3.hierarchy(root).sum((d) => d[opacityvar]);

    
    // console.log(root);

    var tree = d3.treemap()
        .size([width, height])
        .paddingTop(28)
        .paddingRight(7)
        .paddingInner(3)      // Padding between each rectangle
        // .paddingOuter(6)
        // .padding(20)
        (root)

    var colorrange = d3.map(data, (d) =>  d[groupvar]).keys();
    var color = d3.scaleOrdinal(d3.schemeCategory10).domain(colorrange);

    var opacityrange = d3.extent(data, (d) => d[opacityvar]);
    var opacity = d3.scaleLinear()
        .domain(opacityrange)
        .range([.5,1]);

    var tooltipbg = svg
        .append('g')
        .append('rect')
            .style("opacity", 0)

    var tooltiptext = svg
        .append('g')
        .append('text') 
            .style("opacity", 0)
            .attr("text-anchor", "left")
            .attr("alignment-baseline", "middle");

    var rects = svg
        .select(".rects")
        .selectAll("rect")
        .data(root.leaves(), (d,i) => (i) + ":" + (d.data.Rank) + ":" + d.x1 + ":"+ d.x0 + ":" + d.y1 + ":"+ d.y0)

    rects
        .exit()
        .remove();

    rects = rects
        .enter()
        .append("rect")
            .attr('x',  (d) => d.x0)
            .attr('y',  (d) => d.y0)
            .attr('width',  0)
            .attr('height',  0)
            .style("stroke", "black")
            .style("fill", (d) => color(d.parent.data.name))
            .style("opacity", (d) => opacity(d.data[opacityvar]))
            .on("mousemove",function(d){
                // div.style("display","none");
                tooltiptext
                    .html(
                        "<tspan x="+(d3.mouse(this)[0]+20)+" dy="+(20)+">" + 
                            "Global" + ": " + d.data.Global +
                        "</tspan>" + 
                        "<tspan x="+(d3.mouse(this)[0]+20)+" dy="+(20)+">" + 
                            h1var + ": " + d.data[h1var] +
                        "</tspan>" + 
                        "<tspan x="+(d3.mouse(this)[0]+20)+" dy="+(20)+">" + 
                            opacityvar + ": " + d.data[opacityvar] +
                        "</tspan>" + 
                        "<tspan x="+(d3.mouse(this)[0]+20)+" dy="+(20)+">" + 
                            groupvar + ": " + d.data[groupvar] +
                        "</tspan>"
                    )
                    .attr("x", d3.mouse(this)[0]+10)
                    .attr("y", d3.mouse(this)[1]+10)
                    .style("cursor", "context-menu")
                    .style("opacity", 1);
                
                tooltipbg
                    .attr("x", d3.mouse(this)[0]+10)
                    .attr("y", d3.mouse(this)[1]+10)
                    .style("opacity", 1)
                    .attr('fill', "lightgray")
                    .attr('width', tooltiptext.node().getBoundingClientRect().width + 20)
                    .attr('height', tooltiptext.node().getBoundingClientRect().height+ 5)
                if(d3.mouse(this)[0] > width/2) {
                    tooltiptext
                            .attr("x", d3.mouse(this)[0]-tooltiptext.node().getBoundingClientRect().width-20)
                    tooltiptext
                        .html(
                            "<tspan x="+(d3.mouse(this)[0]-tooltiptext.node().getBoundingClientRect().width-20)+" dy="+(20)+">" + 
                                "Global" + ": " + d.data.Global +
                            "</tspan>" + 
                            "<tspan x="+(d3.mouse(this)[0]-tooltiptext.node().getBoundingClientRect().width-20)+" dy="+(20)+">" + 
                                h1var + ": " + d.data[h1var] +
                            "</tspan>" + 
                            "<tspan x="+(d3.mouse(this)[0]-tooltiptext.node().getBoundingClientRect().width-20)+" dy="+(20)+">" + 
                                opacityvar + ": " + d.data[opacityvar] +
                            "</tspan>" + 
                            "<tspan x="+(d3.mouse(this)[0]-tooltiptext.node().getBoundingClientRect().width-20)+" dy="+(20)+">" + 
                                groupvar + ": " + d.data[groupvar] +
                            "</tspan>"
                        )
                    tooltipbg
                        .attr("x", d3.mouse(this)[0]-tooltiptext.node().getBoundingClientRect().width-30)
                }

                if(d3.mouse(this)[1] > height/2) {
                    tooltiptext
                        .attr("y", d3.mouse(this)[1]-tooltiptext.node().getBoundingClientRect().height-10)
                
                    tooltipbg
                        .attr("y", d3.mouse(this)[1]-tooltiptext.node().getBoundingClientRect().height-10)
                }
            })
            .on("mouseout",function(){
                tooltiptext.html(" ").style("opacity", 0)
                tooltipbg.style("opacity", 0)
            });
            
    var textsize = 12;
    var texts = svg
        .select(".texts")
        .selectAll("text")
        .data(root.leaves(), (d,i) => (i) + ":" + (d.data.Rank) + ":" + d.x1 + ":"+ d.x0 + ":" + d.y1 + ":"+ d.y0)

    texts
        .exit()
        .remove();

    texts = texts
        .enter()
        .append("text")
            .attr("x", function(d){ return d.x0})    // +10 to adjust position (more right)
            .attr("y", function(d){ return d.y0})    // +20 to adjust position (lower)
            .text(function(d){ 
                var nname = d.data[h1var].length;
                var rectwidth = d.x1 - d.x0;
                var maxntext = (rectwidth/(textsize/2));
                if(nname > maxntext) {
                    return d.data[h1var].substring(0, nname-(nname-maxntext))+"...";
                }
                return d.data[h1var] 
            })
            .attr("font-size", textsize+"px")
            .attr("fill", "white")

    // var vals = svg
    //     .select(".vals")
    //     .selectAll("text")
    //     .data(root.leaves(), (d,i) => (i) + ":" + (d.data.Rank) + ":" + d.x1 + ":"+ d.x0 + ":" + d.y1 + ":"+ d.y0)
    
    // vals
    //     .exit()
    //     .remove();

    // vals = vals
    //     .enter()
    //     .append("text")
    //         .attr("x", function(d){ return d.x0})    // +10 to adjust position (more right)
    //         .attr("y", function(d){ return d.y0})    // +20 to adjust position (lower)
    //         .text(function(d){ return d.data[h2var] })
    //         .attr("font-size", "10px")
    //         .attr("fill", "white")
            
    var titles = svg
        .select(".titles")
        .selectAll("text")
        .data(root.descendants().filter(function(d){console.log(d); return d.depth==1}), (d,i) => (i) + ":" + (d.data.name) + ":" + d.x1 + ":"+ d.x0 + ":" + d.y1 + ":"+ d.y0)
    
    titles
        .exit()
        .remove();
    
    titles = titles
        .enter()
        .append("text")
            .attr("x", function(d){ return d.x0})
            .attr("y", function(d){ return d.y0+21})
            .text(function(d){ 
                var nname = d.data.name.length;
                var rectwidth = d.x1 - d.x0;
                var maxntext = (rectwidth/(textsize/0.3));
                if(nname > maxntext) {
                    return d.data.name.substring(0, nname-(nname-maxntext))+"...";
                }
                return d.data.name;
            })
            .attr("font-size", "19px")
            .attr("fill",  (d) => "white" )

    rects
        .transition()
        .duration(1000)
            .attr('width',  (d) => d.x1 - d.x0)
            .attr('height',  (d) => d.y1 - d.y0)
            .style("stroke", "black")
            .style("fill", (d) => color(d.parent.data.name))
            .style("opacity", (d) => opacity(d.data[opacityvar]))

    texts
        .transition()
        .duration(1000)
        .attr("x", function(d){ return d.x0+5})    // +10 to adjust position (more right)
        .attr("y", function(d){ return d.y0+20})    // +20 to adjust position (lower)
        .text(function(d){ 
            var nname = d.data[h1var].length;
            var rectwidth = d.x1 - d.x0;
            var maxntext = (rectwidth/(textsize/1.4));
            if(nname > maxntext) {  
                return d.data[h1var].substring(0, nname-(nname-maxntext))+"...";
            }
            return d.data[h1var] 
        })
        .attr("font-size", textsize+"px")
        .attr("fill", "white")
    
    // vals
    //     .transition()
    //     .duration(1000)
    //     .attr("x", function(d){ return d.x0+5})    // +10 to adjust position (more right)
    //     .attr("y", function(d){ return d.y0+35})    // +20 to adjust position (lower)
    //     .text(function(d){ return d.data[h2var] })
    //     .attr("font-size", "11px")
    //     .attr("fill", "white")

    titles
        .transition()
        .duration(1000)
        .attr("x", function(d){ return d.x0})
        .attr("y", function(d){ return d.y0+21})
        .text(function(d){ 
            var nname = d.data.name.length;
            var rectwidth = d.x1 - d.x0;
            var maxntext = (rectwidth/(textsize/1.2));
            if(nname > maxntext) {
                return d.data.name.substring(0, nname-(nname-maxntext))+"...";
            }
            return d.data.name; 
        })
        .attr("font-size", "19px")
        .attr("fill",  function(d){ return color(d.data.name)} )
}