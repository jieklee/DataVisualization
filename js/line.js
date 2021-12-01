function line(data, varjson) {
    var margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = document.getElementById("line-area").clientWidth - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    var svg = d3.select("#line-area")
    .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");
    
    svg.append("g")
        .attr("class", "x-axis")

    svg.append("g")
        .attr("class", "y-axis")

    svg.append("g")
        .attr("class", "lines")

    svg
        .append('line')
        .attr("class","tooltipline");

    svg.append("g")
        .attr("class", "colorlegend")
    
    svg.append("g")
        .attr("class", "x-axis-label")
        .append("text");

    svg.append("g")
        .attr("class", "y-axis-label")
        .append("text");

    lineChange(data, varjson);
}

function lineChange(data, varjson) {
    var xvar = "Year";
    var yvar = "Publisher";

    var speed = 1000;

    if(varjson) {
        xvar = varjson.xvar;
        yvar = varjson.yvar;
    }

    var margin = {top: 10, right: 30, bottom: 30, left: 40},
    width = document.getElementById("line-area").clientWidth - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
    

    // append the svg object to the body of the page
    var svg = d3
        .select("#line-area")
        .select("svg")
        .select("g");

    var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
        .key(function(d) { return d[yvar];})
        .rollup((leaves) => 
            d3.nest()
            .key((d) => d[xvar])
            .rollup((d) => d.length)
            .entries(leaves)
        )
        .entries(data);
    
    var xrange = d3.extent(data, function(d) { return d[xvar]; });

    sumstat.forEach(element => {
        for(var i=xrange[0]; i<=xrange[1]; i++) {
            if(!element.value.find( d => d.key == i)) {
                element.value.push({key: i+"", value: 0});
            }
        }
    });

    // filter nan key
    sumstat.forEach(element => {
        element.value = element.value.filter((d) => d.key != "null");
    });

    
    var x = d3.scaleLinear()
        .domain(xrange)
        .range([ 0, width ]);
    svg
        .selectAll(".x-axis")
        .transition()
        .duration(speed)
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    // Add Y axis
    var ymax = sumstat.map((d) => d.value).flat().map(d => d.value);
    ymax = d3.max(ymax);
    var y = d3.scaleLinear()
        .domain([0, ymax])
        .range([ height, 0 ]);
    svg
        .selectAll(".y-axis")
        .transition()
        .duration(speed)
        .call(d3.axisLeft(y));

    // color palette
    var colorrange = sumstat.map(function(d){ return d.key }) // list of group names
    var color = d3.scaleOrdinal()
        .domain(colorrange)
        .range(d3.schemeCategory10)

    // Draw the line
    var lines = svg
        .select(".lines")
        .selectAll("path")
        .data(sumstat, (d) => {
            var temp = d.key + "-";
            d.value.forEach((values) => {
                temp = temp + values.key + ":" + values.value + ",";
            })
            return temp;
        });

    lines.exit().remove();

    lines
        .enter()
        .append("path")
            .attr("fill", "none")
            .attr("stroke", function(d){ return color(d.key) })
            .attr("stroke-width", 1.5)
            .attr("d", function(d){
                return d3.line()
                .x(0)
                .y(function(d) { return y(d.value); })
                (d.value.sort((a,b) => a.key - b.key))
            })
            .on("mouseover", function (d) {
                console.log("hihi")
                svg
                    .select(".lines")
                    .selectAll("path")
                    .style("opacity", 0.3);
                d3
                    .select(this)
                    .style("opacity", 1);
            })
            .on("mouseout", function (d) {
                console.log("hihi")
                svg
                    .select(".lines")
                    .selectAll("path")
                    .style("opacity", 1);
            })
        .transition()
        .duration(speed)
            .attr("fill", "none")
            .attr("stroke", function(d){ return color(d.key) })
            .attr("stroke-width", 1.5)
            .attr("d", function(d){
                return d3.line()
                .x(function(d) { return x(d.key); })
                .y(function(d) { return y(d.value); })
                (d.value.sort((a,b) => a.key - b.key))
            });

    var size = 20;
    var dots = svg
        .select(".colorlegend")
        .selectAll("rect")
        .data(colorrange);

    dots.exit().remove();

    function position(d,i) {
        var c = Math.round(colorrange.length/4);   // number of columns
        var h = 20;  // height of each entry
        var w = 220; // width of each entry (so you can position the next column)
        var tx = 10; // tx/ty are essentially margin values
        var ty = 10;
        var x = i % c * w + tx;
        var y = Math.floor(i / c) * h + ty;
        return "translate(" + (x) + "," + (y+490) + ")";
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
            .style("fill", function(d){ return color(d)});

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

    if(d3.select("#lineparallel") && d3.select("#lineparallel").property("checked")) {
        var tooltipbg = svg
            .append('g')
            .append('rect')
                .style("opacity", 0)

    //   // Create the text that travels along the curve of chart
        var tooltiptext = svg
            .append('g')
            .append('text') 
                .style("opacity", 0)
                .attr("text-anchor", "left")
                .attr("alignment-baseline", "middle")

    //   // Create a rect on top of the svg area: this rectangle recovers mouse position
        svg
            .append('rect')
            .attr("class", "tooltipeventer")
            .style("fill", "none")
            .style("pointer-events", "all")
            .attr('width', width)
            .attr('height', height)
            .on('mouseover', mouseover)
            .on('mousemove', mousemove)
            .on('mouseout', mouseout);
    } else {
        svg
            .select(".tooltipeventer")
            .remove();
    }

    svg
        .select(".x-axis-label")   
        .select("text")           
        .attr("transform",
              "translate(" + (width/2) + " ," + 
                             (height + margin.top + 20) + ")")
        .style("text-anchor", "middle")
        .text(xvar);
  
    // text label for the y axis
    svg
        .select(".y-axis-label")   
        .select("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text(yvar);

    // What happens when the mouse move -> show the annotations at the right positions.
    function mouseover() {
        tooltipbg.style("opacity",1)
        tooltiptext.style("opacity",1)
    }

    function mousemove() {
        // recover coordinate we need   
        var x0 = Math.round(x.invert(d3.mouse(this)[0]));
        // var i = bisect(data, x0, 0);
        // selectedData = data[i]

        svg.select(".tooltipline")
            .attr('stroke', 'black')
            .attr('x1', x(x0))
            .attr('x2', x(x0))
            .attr('y1', 0)
            .attr('y2', height)

        var temp = "";

        sumstat.forEach(d => {
            temp = temp + 
                "<tspan x="+(x(x0)+15)+" dy="+(20)+" fill="+color(d.key)+">" + 
                d.key + ": " + d.value.filter(years => years.key == x0+"")[0].value + 
                "</tspan>";
        })

        tooltipbg
            .attr("x", x(x0))
            .attr("y", d3.mouse(this)[1])
            .attr('fill', "lightgray")
                .attr('width', tooltiptext.node().getBoundingClientRect().width + 30)
                .attr('height', tooltiptext.node().getBoundingClientRect().height+ 5)

        tooltiptext
            .html(temp)
                .attr("x", x(x0))
                .attr("y", d3.mouse(this)[1])

        if(x0 > xrange[0]+(xrange[1]-xrange[0])/2) {
            tooltipbg
                .attr("x", x(x0)-tooltiptext.node().getBoundingClientRect().width-30)
            tooltiptext
                    .attr("x", x(x0)-tooltiptext.node().getBoundingClientRect().width-30)
            temp = "";
            sumstat.forEach(d => {
                temp = temp + 
                    "<tspan x="+(x(x0)-tooltiptext.node().getBoundingClientRect().width-15)+" dy="+(20)+" fill="+color(d.key)+">" + 
                    d.key + ": " + d.value.filter(years => years.key == x0+"")[0].value + 
                    "</tspan>";
            })
            tooltiptext
                .html(temp)
                    .attr("y", d3.mouse(this)[1])
        }

    }

    function mouseout() {
        tooltipbg.style("opacity", 0)
        tooltiptext.style("opacity", 0)
        svg.select(".tooltipline")
            .attr('stroke', 'none')
    }
}