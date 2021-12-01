function cloud(data, varjson) {
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = document.getElementById("cloud-area").clientWidth - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

    var svg = d3
        .select("#cloud-area")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
        .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");
    
    cloudChange(data, varjson);
}

function cloudChange(data, varjson) {
    var xvar = "Game Title";
    var yvar = "Global";

    if(varjson) {
        xvar = varjson.xvar;
        yvar = varjson.yvar;
    }
    
    var xvaravg = d3.nest() 
        .key((d) => d[xvar])
        .rollup((leaves) => d3.sum(leaves, (d) => d[yvar]))
        .entries(data);
    
    var sizerange = d3.extent(xvaravg.map(d => d.value), (d) => d);
    var size = d3.scaleLinear().domain(sizerange).range([9, 70]);

    var color = d3.scaleOrdinal()
        .domain(d3.map(data, (d) =>  d.key).keys())
        .range(d3.schemeDark2);

    var margin = {top: 10, right: 10, bottom: 10, left: 10},
    width = document.getElementById("cloud-area").clientWidth - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

    var svg = d3.select("#cloud-area")
        .select("svg")
        .select("g");

    var layout = d3.layout.cloud()
        .size([width, height])
        .words(xvaravg.map(function(d) { return {text: d.key, size:d.value}; }))
        .padding(5)        //space between words
        // .rotate(() => ~~(Math.random() * 2) * 90)
        .rotate(() => ~~(0))
        .fontSize((d) => size(d.size))     // font size of words
        .on("end", draw);
    layout.start();

    function draw(words) {
        svg
            .select(".words")
            .transition()
            .duration(1000)
            .style("opacity", "0")

        svg
            .select(".words")
            .transition()
            .delay(1000)
            .remove();

        var word = svg
            .append("g")
                .attr("class", "words")
                .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
            .selectAll("text")
                .data(words)
            .enter()
            .append("text")
                .style("font-size", (d) => d.size + "px")
                .attr("text-anchor", "middle")
                .attr("transform", (d) => "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")")
                .style("fill",(d) =>  color(d.text))
                .text((d) => d.text)
                .style("opacity", "0")
                .style("cursor", "context-menu");
        
        word
            .transition()
            .duration(1000)
            .style("opacity", "1");
    }
}