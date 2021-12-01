function stack(data, varjson) {
    var margin = {top: 10, right: 30, bottom: 60, left: 30},
    width = document.getElementById("stack-area").clientWidth - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    var svg = d3.select("#stack-area")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    stackchange(data, varjson);

    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .attr("class", "x-axis");

    svg.append("g")
        .attr("class", "x-axis-label")
        .append("text");

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .attr("class", "y-axis")
    
    svg.append("g")
        .attr("class", "y-axis-label")
        .append("text");

    svg.append("g")
        .attr("class", "mydots");

    svg.append("g")
        .attr("class", "mylabels");
    stackchange(data, varjson);
}

function stackchange(data, varjson) {
    var xvar = "Platform";
    var yvar = ["Japan","Europe","North America"];

    if(varjson) {
        xvar = varjson.xvar;
        yvar = varjson.yvar;
    }

    var data = d3.nest() 
        .key((d) => d[xvar])
        .rollup((leaves) => {
            var temp = {};
            yvar.forEach(y => {
                temp[y] = d3.sum(leaves, (d) => d[y])
            })
            return temp
        })
        .entries(data);

    var data = data.map((d) => {
        var temp =  {}
        temp[xvar] = d.key
        Object.keys(d.value).forEach((k) => {
            temp[k] = d.value[k]
        });
        return temp
    });

    var margin = {top: 10, right: 30, bottom: 60, left: 30},
    width = document.getElementById("stack-area").clientWidth - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    var svg = d3
        .select("#stack-area")
        .select("svg")
        .select("g");

    var keys = yvar;

    var states = [...new Set(data.map(d => d[xvar]))];

    var x = d3
        .scaleBand()
        .range([margin.left, width - margin.right])
        .padding(0.4);

    var y = d3
        .scaleLinear()
        .rangeRound([height - margin.bottom, margin.top]);

    var z = d3
        .scaleOrdinal()
        .range(d3.schemeTableau10)
        .domain(keys);

    var speed = 1000;

    data.forEach(function(d) {
        d.total = d3.sum(keys, k => +d[k])
        return d
    });

    y.domain([0, d3.max(data, d => d3.sum(keys, k => +d[k]))]).nice();

    svg
        .selectAll(".y-axis")
        .transition()
        .duration(speed)
        .call(d3.axisLeft(y));

    data.sort(d3.select("#stacksort") && d3.select("#stacksort").property("checked")
        ? (a, b) => b.total - a.total
        : (a, b) => states.indexOf(a[xvar]) - states.indexOf(b[xvar]));
    // data.sort((a, b) => states.indexOf(a[xvar]) - states.indexOf(b[xvar]))

    x.domain(data.map(d => d[xvar]));

    svg
        .selectAll(".x-axis")
        .transition()
        .duration(speed)
        .call(d3.axisBottom(x))
        .selectAll("text")
            .style("text-anchor", "start")
            .attr("dx", ".8em")
            .attr("dy", ".15em")
            .attr("transform", "rotate(35)");

    var group = svg
        .selectAll("g.layer")
        .data(d3.stack().keys(keys)(data), d => d.key)
            .style("fill", function(d, i) { return z(d.key); });

    group.exit().remove();

    group
        .enter()
        .append("g")
        .classed("layer", true)
            .attr("fill", d => z(d.key));

    var bars = svg
        .selectAll("g.layer")
        .selectAll("rect")
        .data(d => d, (d) =>  d["0"]+":"+d["1"]+":"+d.data[xvar]);

    bars.exit().remove();

    bars
        .enter()
        .append("rect")
            .attr("x", d => x(d.data[xvar]))
            .attr("y", d => y(d[1]))
        .merge(bars)
        .transition()
        .duration(speed)
            .attr("width", x.bandwidth())
            .attr("x", d => x(d.data[xvar]))
            .attr("y", d => y(d[1]))
            .attr("height", d => y(d[0]) - y(d[1]));

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
        .attr("y", 0 - margin.left-2)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Value");
    
    var size = 20;
    var dots = svg
        .select(".mydots")
        .selectAll("rect")
        .data(keys);

    dots.exit().remove();

    dots
        .enter()
        .append("rect")
            .attr("transform","translate("+(width-150)+",0)")
            .attr("x", 10)
            .attr("y", function(d,i){ return 0 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
            .attr("width", size)
            .attr("height", size)
            .style("fill", function(d){ return z(d)});

    var labels = svg
        .select(".mylabels")
        .selectAll("text")
        .data(keys, (d,i) => i+":"+d);

    labels.exit().remove();
    
    // Add one dot in the legend for each name.
    labels
        .enter()
        .append("text")
            .attr("transform","translate("+(width-150)+",0)")
            .attr("x", 10 + size*1.2)
            .attr("y", function(d,i){ return 1 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
            .style("fill", function(d){ return z(d)})
        .text(function(d){ return d})
            .attr("text-anchor", "left")
            .style("alignment-baseline", "middle");
}