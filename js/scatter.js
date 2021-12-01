function scatter(data, varjson) {
    var margin = {top: 30, right: 40, bottom: 30, left: 40},
    width = document.getElementById("scatter-area").clientWidth - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    var svg = d3.select("#scatter-area").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
            .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "x-axis")

    svg.append("g")
        .attr("class", "y-axis")

    svg.append("g")
        .attr("class", "circles")

    svg.append("g")
        .attr("class", "sizelegend")

    svg.append("g")
        .attr("class", "colorlegend")

    svg.append("g")
        .attr("class", "x-axis-label")
        .append("text");

    svg.append("g")
        .attr("class", "y-axis-label")
        .append("text");

    scatterChange(data, varjson);
}

function scatterChange(data, varjson) {
    var xvar = "Year";
    var yvar = "Review";
    var colorvar = "Genre";
    var sizevar = "Global";

    if(varjson) {
        xvar = varjson.xvar;
        yvar = varjson.yvar;
        colorvar = varjson.colorvar;
        sizevar = varjson.sizevar;
    }

    var margin = {top: 30, right: 40, bottom: 30, left: 40},
    width = document.getElementById("scatter-area").clientWidth - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

    var svg = d3.select("#scatter-area").select("svg")
            .select("g");

    var xrange = d3.extent(data, (d) => d[xvar]);
    var yrange = d3.extent(data, (d) => d[yvar]);
    var colorrange = d3.map(data, (d) =>  d[colorvar]).keys();

    var x = d3.scaleLinear().domain([xrange[0]-1, xrange[1]+1]).range([0, 0]);
    var xAxis = svg.select(".x-axis")
        .attr("transform","translate("+0+","+height+")")
        .call(d3.axisBottom().scale(x));

    var y = d3.scaleLinear().domain([yrange[0]-1, yrange[1]+1]).range([0, 0]);
    var yAxis = svg.select(".y-axis")
        .attr("transform","translate("+0+","+height+")")
        .call(d3.axisLeft().scale(y));

    var color = d3.scaleOrdinal(d3.schemeCategory10).domain(colorrange);

    var sizerange = d3.extent(data, (d) => d[sizevar]);
    var size = d3.scaleLinear().domain(sizerange).range([4,30]);

    var tooltiptext = svg
        .append('g')
        .append('text') 
            .style("opacity", 0)
            .attr("text-anchor", "left")
            .attr("alignment-baseline", "middle");

    svg.select('.circles').selectAll("circle").remove()

    var circles = svg
        .select('.circles')
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
            .attr("cx",  (d) => 0 )
            .attr("cy",  (d) => height )
            .attr("r", (d) => d3.select("#scatterenablesize") && d3.select("#scatterenablesize").property("checked") ? size(d[sizevar]) : 7)
            .style("fill",(d) => d3.select("#scatterenablecolor") && d3.select("#scatterenablecolor").property("checked") ? color(d[colorvar]) : "#000000")
            .style("opacity", 0.3)
            .style("stroke", "white")
            .on("mousemove",function(d){
                var mouseVal = d3.mouse(this);
                console.log(d)
                // div.style("display","none");
                tooltiptext
                    .html(
                        "<tspan x="+(d3.mouse(this)[0]+20)+" dy="+(20)+">" + 
                            sizevar + ": " + d[sizevar] +
                        "</tspan>" + 
                        "<tspan x="+(d3.mouse(this)[0]+20)+" dy="+(20)+">" + 
                            colorvar + ": " + d[colorvar] +
                        "</tspan>" + 
                        "<tspan x="+(d3.mouse(this)[0]+20)+" dy="+(20)+">" + 
                            yvar + ": " + d[yvar] +
                        "</tspan>" + 
                        "<tspan x="+(d3.mouse(this)[0]+20)+" dy="+(20)+">" + 
                            xvar + ": " + d[xvar] +
                        "</tspan>"
                    )
                    .attr("x", d3.mouse(this)[0])
                    .attr("y", d3.mouse(this)[1])
                    .style("cursor", "context-menu")
                    .style("opacity", 1);

                if(Math.round(x.invert(d3.mouse(this)[0])) > xrange[0]+(xrange[1]-xrange[0])/2) {
                    tooltiptext
                            .attr("x", x(d3.mouse(this)[0])-tooltiptext.node().getBoundingClientRect().width-20)
                    tooltiptext
                        .html(
                            "<tspan x="+(d3.mouse(this)[0]-tooltiptext.node().getBoundingClientRect().width-20)+" dy="+(20)+">" + 
                                sizevar + ": " + d[sizevar] +
                            "</tspan>" + 
                            "<tspan x="+(d3.mouse(this)[0]-tooltiptext.node().getBoundingClientRect().width-20)+" dy="+(20)+">" + 
                                colorvar + ": " + d[colorvar] +
                            "</tspan>" + 
                            "<tspan x="+(d3.mouse(this)[0]-tooltiptext.node().getBoundingClientRect().width-20)+" dy="+(20)+">" + 
                                yvar + ": " + d[yvar] +
                            "</tspan>" + 
                            "<tspan x="+(d3.mouse(this)[0]-tooltiptext.node().getBoundingClientRect().width-20)+" dy="+(20)+">" + 
                                xvar + ": " + d[xvar] +
                            "</tspan>"
                        )
                }
            })
            .on("mouseout",function(){tooltiptext.html(" ").style("opacity", 0)});

    svg
        .select(".x-axis-label")   
        .select("text")           
        .attr("transform",
                "translate(" + (width/2) + " ," + 
                                (height + margin.top) + ")")
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

    x.range([0, width])
    xAxis
        .transition()
        .duration(1000)
        .attr("transform","translate(0,"+(height)+")")
        .call(d3.axisBottom().scale(x).tickFormat(d3.format("d")));

    y.range([height, 0]);
    yAxis
        .transition()
        .duration(1000)
        .attr("transform","translate("+0+",0)")
        .call(d3.axisLeft().scale(y));

    circles
        .transition()
        .duration(1000)
        .attr("cx",  (d) => x(d[xvar]) )
        .attr("cy",  (d) => y(d[yvar]) );

    var valuesToShow = [...sizerange, Math.round((sizerange[1]-sizerange[0])/2)];

    if(d3.map(sizerange, (d) =>  d).keys().length == 1) {
        var valuesToShow = [sizerange[0]];
    }

    var xCircle = margin.left
    var xLabel = margin.left + 50
    var yCircle = 555  

    if(d3.select("#scatterenablesize") && d3.select("#scatterenablesize").property("checked")) {
        var sizelegend = svg
            .select(".sizelegend")
            .selectAll("circle")
            .data(valuesToShow, d => d);

        sizelegend
            .exit()
            .remove();
        
        sizelegend
            .enter()
            .append("circle")
                .attr("cx", xCircle)
                .attr("cy", function(d){ return yCircle - size(d) } )
                .attr("r", function(d){ return size(d) })
                .style("fill", "none")
                .attr("stroke", "black")

        sizelegend = svg
            .select(".sizelegend")
            .selectAll("line")
            .data(valuesToShow, d => d);

        sizelegend
            .exit()
            .remove();
        
        // Add legend: segments
        sizelegend
            .enter()
            .append("line")
                .attr('x1', function(d){ return xCircle + size(d) } )
                .attr('x2', xLabel-4)
                .attr('y1', function(d){ return yCircle - size(d) } )
                .attr('y2', function(d){ return yCircle - size(d) } )
                .attr('stroke', 'black')
                .style('stroke-dasharray', ('2,2'))

        sizelegend = svg
            .select(".sizelegend")
            .selectAll("text")
            .data(valuesToShow, d => d);

        sizelegend
            .exit()
            .remove();
        
        // Add legend: labels
        sizelegend
            .enter()
            .append("text")
                .attr('x', xLabel)
                .attr('y', function(d){ return yCircle - size(d) } )
                .text( function(d){ return d } )
                .style("font-size", 10)
                .attr('alignment-baseline', 'middle')
    } else {
        svg
            .select(".sizelegend")
            .selectAll("*")
            .remove();
    }

    svg
        .select(".colorlegend")
        .selectAll("*")
        .remove();

    // if(d3.select("#scatterenablecolor") && d3.select("#scatterenablecolor").property("checked")) {
        var size = 20;
        var dots = svg
            .select(".colorlegend")
            .selectAll("rect")
            .data(colorrange);

        dots.exit().remove();

        function position(d,i) {
            var c = Math.round(colorrange.length/4);   // number of columns
            var h = 20;  // height of each entry
            var w = 150; // width of each entry (so you can position the next column)
            var tx = 10; // tx/ty are essentially margin values
            var ty = 10;
            var x = i % c * w + tx;
            var y = Math.floor(i / c) * h + ty;
            return "translate(" + (x+(d3.select("#scatterenablesize") && d3.select("#scatterenablesize").property("checked") ? 130 : 0)) + "," + (y+465) + ")";
        }

        dots
            .enter()
            .append("rect")
                // .attr("transform","translate("+(width-150)+",0)")
                .attr("transform", position)
                .attr("x", 10)
                // .attr("y", function(d,i){ return 0 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
                .attr("width", size)
                .attr("height", size)
                .style("fill", function(d){ return color(d)})
                .style("opacity", 0.5);

        var labels = svg
            .select(".colorlegend")
            .selectAll("text")
            .data(colorrange, (d,i) => i+":"+d);

        labels.exit().remove();
        
        // Add one dot in the legend for each name.
        labels
            .enter()
            .append("text")
                .attr("transform", position)
                .attr("x", 10 + size*1.2)
                .attr("y", 10 ) // 100 is where the first dot appears. 25 is the distance between dots
                .style("fill", function(d){ return color(d)})
            .text(function(d){ return d})
                .attr("text-anchor", "left")
                .style("alignment-baseline", "middle")
                .style("opacity", 1);
    // } else {
        // svg
        //     .select(".colorlegend")
        //     .selectAll("*")
        //     .remove();
    // }
}

