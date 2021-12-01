function box(data, varjson,wantpoint) {
    var margin = {top: 50, right: 70, bottom: 100, left: 20},
    width = document.getElementById("stackbar-area").clientWidth - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;
    // append the svg object to the body of the page

    var svg = d3.select("#box-area")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var xvar = "Platform";
    var yvar = "Global";

    if(varjson) {
        xvar = varjson.xvar;
        yvar = varjson.yvar;
    }

    var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d[xvar];})
    .rollup(function(d) {
        q1 = d3.quantile(d.map(function(g) { return g[yvar];}).sort(d3.ascending),.25)
        median = d3.quantile(d.map(function(g) { return g[yvar];}).sort(d3.ascending),.5)
        q3 = d3.quantile(d.map(function(g) { return g[yvar];}).sort(d3.ascending),.75)
        interQuantileRange = q3 - q1
        min = q1 - 1.5 * interQuantileRange
        max = q3 + 1.5 * interQuantileRange
        return({q1: q1, median: median, q3: q3, interQuantileRange: interQuantileRange, min: min, max: max})
    })
    .entries(data)

    // Show the X scale
    var x = d3.scaleBand()
        .range([ 0, 50 ])
        .domain(d3.map(data, (d) =>  d[xvar]).keys())
        .paddingInner(1)
        .paddingOuter(.5)
    var xAxis = svg
        .append("g")
            .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        // .selectAll("text")
        //     .attr("transform", "rotate(30)")
        //     .style("text-anchor", "start")
    
    // Show the Y scale
    var ymin = d3.min(data.map(d => d[yvar]))
    var ymax = d3.max(data.map(d => d[yvar]))
    var y = d3.scaleLinear()
        .domain([ymin-10,ymax+10])
        .range([height, 0])
    svg.append("g").call(d3.axisLeft(y))

    // Show the main vertical line
    var lines = svg
    .selectAll("vertLines")
    .data(sumstat)
    .enter()
    .append("line")
        .attr("x1", function(d){return(x(d.key))})
        .attr("x2", function(d){return(x(d.key))})
        .attr("y1", function(d){return(y(d.value.min))})
        .attr("y2", function(d){return(y(d.value.max))})
        .attr("stroke", "black")
        .style("width", 40)

    // rectangle for the main box
    var boxWidth = 40
    var boxs = svg
        .selectAll("boxes")
        .data(sumstat)
        .enter()
        .append("rect")
            .attr("x", function(d){return(x(d.key)-boxWidth/2)})
            .attr("y", function(d){return(y(d.value.q3))})
            .attr("height", function(d){return(y(d.value.q1)-y(d.value.q3))})
            .attr("width", boxWidth)
            .attr("stroke", "black")
            .style("fill", "#69b3a2")

    // Show the median
    var medianlines = svg
    .selectAll("medianLines")
    .data(sumstat)
    .enter()
    .append("line")
        .attr("x1", function(d){return(x(d.key)-boxWidth/2) })
        .attr("x2", function(d){return(x(d.key)+boxWidth/2) })
        .attr("y1", function(d){return(y(d.value.median))})
        .attr("y2", function(d){return(y(d.value.median))})
        .attr("stroke", "black")
        .style("width", 80)
    
    
    var jitterWidth = 50
    var points
    if(wantpoint) {
        points = svg
            .selectAll("indPoints")
            .data(data)
            .enter()
            .append("circle")
                .attr("cx", function(d){return(x(d[xvar]) - jitterWidth/2 + Math.random()*jitterWidth )})
                .attr("cy", function(d){return(y(d[yvar]))})
                .attr("r", 4)
                .style("fill", "white")
                .attr("stroke", "black")
    }

    x.range([ 0, width ]);
    xAxis
        .transition()
        .duration(1000)
        .call(d3.axisBottom(x).scale(x))
        .selectAll("text")
            .attr("transform", "rotate(30)")
            .style("text-anchor", "start")

    lines
        .transition()
        .duration(1000)
        .attr("x1", function(d){return(x(d.key))})
        .attr("x2", function(d){return(x(d.key))})
        .attr("y1", function(d){return(y(d.value.min))})
        .attr("y2", function(d){return(y(d.value.max))})
        .attr("stroke", "black")
        .style("width", 40)

    boxs
        .transition()
        .duration(1000)
        .attr("x", function(d){return(x(d.key)-boxWidth/2)})
        .attr("y", function(d){return(y(d.value.q3))})
        .attr("height", function(d){return(y(d.value.q1)-y(d.value.q3))})
        .attr("width", boxWidth )
        .attr("stroke", "black")
        .style("fill", "#69b3a2")
    medianlines
        .transition()
        .duration(1000)
        .attr("x1", function(d){return(x(d.key)-boxWidth/2) })
        .attr("x2", function(d){return(x(d.key)+boxWidth/2) })
        .attr("y1", function(d){return(y(d.value.median))})
        .attr("y2", function(d){return(y(d.value.median))})
        .attr("stroke", "black")
        .style("width", 80)

    if(wantpoint) {
        points
            .transition()
            .duration(1000)
                .attr("cx", function(d){return(x(d[xvar]) - jitterWidth/2 + Math.random()*jitterWidth )})
                .attr("cy", function(d){return(y(d[yvar]))})
                .attr("r", 1)
                .style("fill", "white")
                .attr("stroke", "black")
    }

}