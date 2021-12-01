function rigidline(data, varjson) {
    var margin = {top: 50, right: 0, bottom: 50, left:50},
    width = document.getElementById("rigidline-area").clientWidth - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    var svg = d3.select("#rigidline-area")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", "translate(0," + height + ")")

    svg.append("g")
        .attr("class", "y-axis")

    svg.append("g")
        .attr("class", "curves")

    svg.append("g")
        .attr("class", "x-axis-label")
        .append("text");

    svg.append("g")
        .attr("class", "y-axis-label")
        .append("text");
    rigidlineChange(data, varjson);
}

function rigidlineChange(data, varjson) {
    var margin = {top: 50, right: 0, bottom: 50, left:50},
    width = document.getElementById("rigidline-area").clientWidth - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;
    
    var speed = 1000;
    var xvar = "Year";
    var yvar = "Platform";
    if(varjson) {
        xvar = varjson.xvar;
        yvar = varjson.yvar;
    }

    // append the svg object to the body of the page
    var svg = d3.select("#rigidline-area")
        .select("svg")
        .select("g");

    var ys = d3.map(data, d => d[yvar]).keys();
    var ny = ys.length; 
    
    // Compute the mean of each group
    ymeans = []
    for (i in ys){
        currenty = ys[i]
        mean = data.filter((d) => d[yvar] == ys[i]).map(function(d){ return  d[xvar]; })
        mean = d3.mean(mean, d => d)
        ymeans.push(mean)
    }
    
    var xrange = d3.extent(data, (d) => d[xvar]);
    // Create a color scale using these mean.
    var color = d3.scaleSequential()
        .domain(xrange)
        .interpolator(d3.interpolateViridis);

    var x = d3.scaleLinear()
        .domain([xrange[0]-10,xrange[1]+10])
        .range([ 0, 50 ]);
    var xAxis = svg
        .select(".x-axis")
        .transition().duration(speed)
        .call(d3.axisBottom(x).scale(x).tickFormat(d3.format("d")))

    svg
        .selectAll(".x-axis")
        .select(".domain").remove()

    var y = d3.scaleLinear()
        .domain([0, 1])  
        .range([ height, 0]);

        // Create the Y axis for names
    var yName = d3.scaleBand()
        .domain(ys)
        .range([0, height])
        .paddingInner(1)
    svg
        .select(".y-axis")
        .transition().duration(speed)
        .call(d3.axisLeft(yName).tickSize(0))

    svg
        .selectAll(".y-axis")
        .select(".domain").remove()

    var kde = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(29)) // increase this 40 for more accurate density.
    var allDensity = []
    for (i = 0; i < ny; i++) {
        key = ys[i]
        density = kde( data.filter((d) => d[yvar] == ys[i]).map(function(d){ return  d[xvar]; }) )
        allDensity.push({key: key, density: density})
    }
    
    var curves = svg
        .select(".curves")
        .selectAll("path")
        .data(allDensity, d => d)

        curves
        .exit()
        .remove();
    
    // // Add areas
    curves = curves
        .enter()
        .append("path")
        .attr("transform", function(d){return("translate(0," + (yName(d.key)-height) +")" )})
        .attr("fill", function(d){
            grp = d.key;
            index = ys.indexOf(grp)
            value = ymeans[index]
            return color(value)
        })
        .datum(function(d){return(d.density)})
        .attr("opacity", 0.7)
        .attr("stroke", "#000") 
        .attr("stroke-width", 0.1)
        .attr("d",  d3.line()
            .curve(d3.curveBasis)
            .x(function(d) { return x(d[0]); })
            .y(function(d) { return y(d[1]); })
        )

    svg
        .select(".x-axis-label")   
        .select("text")           
        .attr("transform",
              "translate(" + (width/2) + " ," + 
                             (height + margin.top-20) + ")")
        .style("text-anchor", "middle")
        .text(xvar);
  
    // text label for the y axis
    svg
        .select(".y-axis-label")   
        .select("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left-2)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(yvar);
    
    x.range([ 0, width ]);
    xAxis
        .transition()
        .duration(1000)
        .call(d3.axisBottom(x).scale(x).tickFormat(d3.format("d")))
        .select(".domain").remove()
    
    // Animate densities apparition
    curves
        .transition()
        .duration(1000)
        .attr("d",  d3.line()
            .curve(d3.curveBasis)
            .x(function(d) { return x(d[0]); })
            .y(function(d) { return y(d[1]); })
        )

    
    // This is what I need to compute kernel density estimation
    function kernelDensityEstimator(kernel, X) {
        return function(V) {
        return X.map(function(x) {
            return [x, d3.mean(V, function(v) { return kernel(x - v); })];
        });
        };
    }

    function kernelEpanechnikov(k) {
        return function(v) {
            return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
        };
    }
}