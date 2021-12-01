function heat(data,varjson) {
    var margin = {top: 10, right: 70, bottom: 100, left: 70},
    width = document.getElementById("heat-area").clientWidth - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    var svg = d3.select("#heat-area").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
            .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "x-axis")

    svg.append("g")
        .attr("class", "y-axis")

    svg.append("g")
        .attr("class", "blocks")

    svg.append("g")
        .attr("class", "legend")

    svg.append("g")
        .attr("class", "legendaxis")
    heatChange(data,varjson);
}

function heatChange(data,varjson) {
    var xvar = "Publisher";
    var yvar = "Genre";

    var speed = 1000;

    if(varjson) {
        xvar = varjson.xvar;
        yvar = varjson.yvar;
    }

    var margin = {top: 10, right: 70, bottom: 100, left: 70},
    width = document.getElementById("heat-area").clientWidth - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;

    var data_count = d3.nest()
        .key((d) => d[xvar])
        .key( (d) => d[yvar])
        .rollup((leaves) => leaves.length)
        .entries(data);

    colormax = Math.max(...data_count.map(d => d.values).flat().map(d => d.value));

    var xs = d3.map(data, d => d[xvar]).keys().sort();
    var ys = d3.map(data, d => d[yvar]).keys().sort();

    data_count.forEach(element => {
        ys.forEach(y => {
            if((element.values.filter(d => d.key == y).length) == 0) {
                element.values.push({
                    key: y,
                    value: 0
                });
            }
        })
    });

    var svg = d3
        .select("#heat-area")
        .select("svg")
        .select("g");

    var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(xs)
        // .padding(0.05);
    svg
        .selectAll(".x-axis")
        .transition().duration(speed)
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSize(0))
        .selectAll("text")
        .attr("transform", "rotate(30)")
        .style("text-anchor", "start")
    svg
        .selectAll(".x-axis")
        .select(".domain")
        .remove()

    var y = d3.scaleBand()
        .range([ height, 0 ])
        .domain(ys)
    // .padding(0.05);

    svg
        .selectAll(".y-axis")
        .transition().duration(speed)
        .call(d3.axisLeft(y).tickSize(0))

    svg
        .selectAll(".y-axis")
        .select(".domain").remove()

    var colors = d3.scaleSequential()
        .interpolator(d3.interpolateInferno)
        .domain([0, colormax])

    temp = []

    data_count.forEach(element => {
        element.values.forEach(e => {
            temp.push({});
            temp[temp.length-1][xvar] = element.key
            temp[temp.length-1][yvar] = e.key
            temp[temp.length-1].value = e.value
        })
    });

    svg
        .select(".blocks")
        .selectAll("rect")
        .data([])
        .exit()
        .remove()

    var blocks = svg
        .select(".blocks")
        .selectAll("rect")
        .data(temp)
        .enter()
        .append("rect")
            .attr("x", (d) => (width-100)/2)
            .attr("y", (d) => (height-100)/2)
            // .attr("rx", 4)
            // .attr("ry", 4)
            .attr("width", x.bandwidth())
            .attr("height", y.bandwidth())
            .style("fill", (d) => colors(d.value))
            .style("stroke-width", 4)
            .style("stroke", "none")
            .style("opacity", 0.8);

    blocks
        .transition()
        .duration(2000)
        .attr("x", (d) => x(d[xvar]))
        .attr("y", (d) => y(d[yvar]))

    const linearGradient = svg.append("linearGradient")
        .attr("id", "linear-gradient");
    
    linearGradient.selectAll("stop")
        .data(colors.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: colors(t) })))
        .enter()
        .append("stop")
        .attr("offset", d => d.offset)
        .attr("stop-color", d => d.color);
    
    svg
        .select(".legend")
        .attr("transform", `translate(0,${height+200 - margin.bottom})`)
        .append("rect")
        // .attr('transform', `translate(0, ${height})`)
        .attr("width", width)
        .attr("height", 20)
        .style("fill", "url(#linear-gradient)");

    axisScale = d3.scaleLinear()
        .domain(colors.domain())
        .range([margin.left, width - margin.right])

    var legendaxis = svg
        .select(".legendaxis")
        .attr("transform", `translate(0,${height+200 - margin.bottom})`)
        .call(d3.axisTop(axisScale)
          .ticks(width / 80)
          .tickSize(-20)
          .tickFormat(d3.format("d")))

    legendaxis 
        .select(".domain").remove()

    legendaxis.selectAll("line")
        .style("stroke", "white")
}

