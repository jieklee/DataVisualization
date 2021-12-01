function violinGraph(data, varjson) {
    var xvar = "Publisher";
    var yvar = "Global";
    
    if(varjson) {
        xvar = varjson.xvar;
        yvar = varjson.yvar;
    }

    var margin = {top: 20, right: 20, bottom: 20, left: 20},
    width = document.getElementById("donut-area").clientWidth - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#violin-area")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

    
    var color = d3.scaleOrdinal()
        .domain(d3.map(data, (d) =>  d[xvar]).keys())
        .range(d3.schemeDark2);

    var yrange = d3.extent(data, function(d) { return d[yvar]; })
    var y = d3.scaleLinear()
        .domain([yrange[0]-10, yrange[1]+10])
        .range([height, 0])
    svg.append("g").call(d3.axisLeft(y))

    var x = d3.scaleBand()
        .range([ 0, 50 ])
        .domain(d3.map(data, (d) =>  d[xvar]).keys())
        .padding(0.05)
    var xAxis = svg.append("g")
        .attr("class", "xAxis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))

    var histogram = d3.histogram()
        .domain(y.domain())
        .thresholds(y.ticks(20))    // Important: how many bins approx are going to be made? It is the 'resolution' of the violin plot
        .value(d => d)

    // Compute the binning for each group of the dataset
    var sumstat = d3.nest()  // nest function allows to group the calculation per level of a factor
        .key(function(d) { return d[xvar];})
        .rollup(function(d) {   // For each key..
            input = d.map(function(g) { return g[yvar];})    // Keep the variable called Sepal_Length
            bins = histogram(input)   // And compute the binning on it.
            return(bins)
        })
        .entries(data);
        
    var maxNum = 0
        for ( i in sumstat ){
            allBins = sumstat[i].value
            lengths = allBins.map(function(a){return a.length;})
            longuest = d3.max(lengths)
            if (longuest > maxNum) { maxNum = longuest }
        }
        
        // The maximum width of a violin must be x.bandwidth = the width dedicated to a group
    var xNum = d3.scaleLinear()
        .range([0, 50])
        .domain([-maxNum,maxNum])

    // Add the shape to this svg!
    var myCurves = svg
        .selectAll("myViolin")
        .data(sumstat)
        .enter()        // So now we are working group per group
        .append("g")
        .attr("class", "myCurves1")
        .attr("transform", function(d){ 
            return("translate(" + x(d.key) +" ,0)") 
        } ) // Translation on the right to be at the group position
        
    var temp = myCurves
            .append("path")
            .style("fill", (d) => color(d.value))
            .data(sumstat)
            .datum(function(d){ return(d.value)})     // So now we are working bin per bin
            .style("stroke", "none")
            .attr("d", d3.area()
                .x0(function(d){ return(xNum(-d.length)) } )
                .x1(function(d){ return(xNum(d.length)) } )
                .y(function(d){ return(y(d.x0)) } )
                .curve(d3.curveCatmullRom)    // This makes the line smoother to give the violin appearance. Try d3.curveStep to see the difference
            )

    x.range([ 0, width ]);
    xNum.range([0, x.bandwidth()]);
    
    xAxis
        .transition()
        .duration(5000)
        .call(d3.axisBottom(x))

    // Animate densities apparition
    myCurves
        .transition()
        .duration(5000)
        .attr("transform", function(d){
             return("translate(" + x(d.key) +" ,0)") 
            } ) // Translation on the right to be at the group position
    
    temp
        .transition()
        .duration(5000)
        .style("stroke", "none")
        .attr("d", d3.area()
            .x0(function(d){ return(xNum(-d.length)) } )
            .x1(function(d){ return(xNum(d.length)) } )
            .y(function(d){ return(y(d.x0)) } )
            .curve(d3.curveCatmullRom)    // This makes the line smoother to give the violin appearance. Try d3.curveStep to see the difference
        )
}