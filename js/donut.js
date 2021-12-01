// label,value
// mine: key, value
function donutGraph(data, varjson) {
    var width = document.getElementById("donut-area").clientWidth, 
        height = 600;

    var svg = d3.select("#donut-area")
        .append("svg")
            .attr("width", width)
            .attr("height",  height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    svg.append("g")
        .attr("class", "slices");
    svg.append("g")
        .attr("class", "labels");
    svg.append("g")
        .attr("class", "lines");

    d3.select("#donut-area").select("svg").append('text')
        .html('Grouped data that has less than 5% market share will be listed as others')
        .attr('x', 0)
        .attr('y', 20)

    donutGraphChange(data, varjson);
}  

function mergeWithFirstEqualZero(first, second){
	var secondSet = d3.set(); second.forEach(function(d) { secondSet.add(d.key); });

	var onlyFirst = first
		.filter(function(d){ return !secondSet.has(d.key) })
		.map(function(d) { return {key: d.key, value: 0}; });
	return d3.merge([ second, onlyFirst ])
		.sort(function(a,b) {
			return d3.ascending(a.key, b.key);
		});
}

function donutGraphChange(data, varjson) {
    var xvar = "Publisher";
    if(varjson) {
        xvar = varjson.xvar;
    }

    var data_count = d3.nest()
        .key((d) => d[xvar])
        .rollup((leaves) => leaves.length)
        .entries(data);

    var count_sum = data_count.map(d => d.value).reduce((a, b) => a + b);

    var count_other = 0;
    var count_other_data = [];
    data_count.forEach(element => {
        if(element.value < count_sum/100*5) {
            count_other = count_other + element.value;
            count_other_data.push({key: element.key, value: element.value});
            data_count = data_count.filter(element1 => element1 !== element)
        }
    });
    if(count_other > 0) {
        data_count = [...data_count, {"key":"Other", "value": count_other, otherdata: count_other_data}];
    }
    data = data_count;
    
    var width = document.getElementById("donut-area").clientWidth, 
        height = document.getElementById("donut-area").clientHeight,
        margin = 20;
    var radius = Math.min(width, height) / 4 - margin;

    var duration = 1000;

    var svg = d3.select("#donut-area")
        .select("svg")
        .select("g");

	var data0 = svg.select(".slices").selectAll("path.slice")
		.data().map(function(d) { return d.data });
	if (data0.length == 0) data0 = data;
	var was = mergeWithFirstEqualZero(data, data0);
    var is = mergeWithFirstEqualZero(data0, data);
    
    var key = function(d){ return d.data.key; };
    
    var pie = d3
        .pie()
        .sort(null)
        .value(function(d) {
            return d.value;
        });

    var color = d3
        .scaleOrdinal()
        .domain(d3.map(data, (d) =>  d).keys())
        .range(d3.schemeCategory10);

    var arc = d3.arc()
        .outerRadius(radius * 0.8)
        .innerRadius(radius * 0.5);

    var outerArc = d3.arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

    var slice = svg
        .select(".slices")
        .selectAll("path.slice")
        .data(pie(was), key);

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
        
    slice.enter()
		.insert("path")
		.attr("class", "slice")
		    .style("fill", function(d) { return color(d.data.key); })
            .attr('d', arc)
            .attr("stroke", "white")
            .style("stroke-width", "2px")
            .style("opacity", 0.7)
            .on("mousemove",function(d){
                var mouseVal = d3.mouse(this);
                // div.style("display","none");
                tooltiptext
                    .html(
                    !d.data.otherdata ?
                        "<tspan x="+(d3.mouse(this)[0]+20)+" dy="+(-20)+">" + 
                            "Count: " + d.data.value +
                        "</tspan>" + 
                        "<tspan x="+(d3.mouse(this)[0]+20)+" dy="+(-20)+">" + 
                            "Name: " + d.data.key +
                        "</tspan>"
                        :
                        d.data.otherdata.map(otherdata => 
                            "<tspan x="+(d3.mouse(this)[0]+20)+" dy="+(-20)+">" + 
                            "Count: " + otherdata.value +
                            "</tspan>" + 
                            "<tspan x="+(d3.mouse(this)[0]+20)+" dy="+(-20)+">" + 
                                "Name: " + otherdata.key +
                            "</tspan>"
                        ).join(' ')
                    )
                    .attr("x", d3.mouse(this)[0]+10)
                    .attr("y", d3.mouse(this)[1]+tooltiptext.node().getBoundingClientRect().height/2)
                    .style("cursor", "context-menu")
                    .style("opacity", 1);

                tooltipbg
                    .attr("x", d3.mouse(this)[0]+10)
                    .attr("y", d3.mouse(this)[1]+tooltiptext.node().getBoundingClientRect().height/2-tooltiptext.node().getBoundingClientRect().height-17.5)
                    .attr('fill', "lightgray")
                        .attr('width', tooltiptext.node().getBoundingClientRect().width + 40)
                        .attr('height', tooltiptext.node().getBoundingClientRect().height+ 5)
                        .style("opacity", 1);

                if(d3.mouse(this)[0] > 0) {
                    tooltipbg
                        .attr("x", d3.mouse(this)[0]-tooltiptext.node().getBoundingClientRect().width-50)
        
                    tooltiptext
                        .html(
                            !d.data.otherdata ?
                                "<tspan x="+(d3.mouse(this)[0]-tooltiptext.node().getBoundingClientRect().width-40)+" dy="+(-20)+">" + 
                                    "Count: " + d.data.value +
                                "</tspan>" + 
                                "<tspan x="+(d3.mouse(this)[0]-tooltiptext.node().getBoundingClientRect().width-40)+" dy="+(-20)+">" + 
                                    "Name: " + d.data.key +
                                "</tspan>"
                                :
                                d.data.otherdata.map(otherdata => 
                                    "<tspan x="+(d3.mouse(this)[0]-tooltiptext.node().getBoundingClientRect().width-40)+" dy="+(-20)+">" + 
                                    "Count: " + otherdata.value +
                                    "</tspan>" + 
                                    "<tspan x="+(d3.mouse(this)[0]-tooltiptext.node().getBoundingClientRect().width-40)+" dy="+(-20)+">" + 
                                        "Name: " + otherdata.key +
                                    "</tspan>"
                            ).join(' ')
                        )
                }
            })
            .on("mouseout",function(){
                tooltiptext.html(" ").style("opacity", 0)
                tooltipbg.style("opacity", 0)
            })
            .each(function(d) {
                this._current = d;
            })
    
    slice = svg.select(".slices").selectAll("path.slice")
        .data(pie(is), key);
        
    slice		
		.transition().duration(duration)
		.attrTween("d", function(d) {
			var interpolate = d3.interpolate(this._current, d);
			var _this = this;
			return function(t) {
				_this._current = interpolate(t);
				return arc(_this._current);
			};
        });
        
    slice = svg
        .select(".slices")
        .selectAll("path.slice")
		.data(pie(data), key);

	slice
		.exit()
        .transition()
        .delay(duration)
        .duration(1000)
        .remove();
        
    /* ------- TEXT LABELS -------*/

	var text = svg.select(".labels").selectAll("text")
    .data(pie(was), key);

    text.enter()
        .append("text")
            .attr("dy", ".35em")
            .style("opacity", 0)
            .text(function(d) {
                return d.data.key;
            })
            .each(function(d) {
                this._current = d;
            });

    function midAngle(d){
        return d.startAngle + (d.endAngle - d.startAngle)/2;
    }

    text = svg
        .select(".labels")
        .selectAll("text")
        .data(pie(is), key);

    text
        .transition()
        .duration(duration)
            .style("opacity", function(d) {
                return d.data.value == 0 ? 0 : 1;
            })
            .attrTween("transform", function(d) {
                var interpolate = d3.interpolate(this._current, d);
                var _this = this;
                return function(t) {
                    var d2 = interpolate(t);
                    _this._current = d2;
                    var pos = outerArc.centroid(d2);
                    pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                    return "translate("+ pos +")";
                };
            })
            .styleTween("text-anchor", function(d){
                var interpolate = d3.interpolate(this._current, d);
                return function(t) {
                    var d2 = interpolate(t);
                    return midAngle(d2) < Math.PI ? "start":"end";
                };
            });
	
	text = svg
        .select(".labels")
        .selectAll("text")
		.data(pie(data), key);

	text
		.exit()
        .transition()
        .delay(duration)
        .remove();
        
    /* ------- SLICE TO TEXT POLYLINES -------*/

	var polyline = svg
        .select(".lines")
        .selectAll("polyline")
        .data(pie(was), key);

    polyline
        .enter()
        .append("polyline")
            .attr("stroke", "black")
            .style("fill", "none")
            .attr("stroke-width", 1)
            .style("opacity", 0)
            .attr('points', function(d) {
                var posA = arc.centroid(d) // line insertion in the slice
                var posB = outerArc.centroid(d) // line break: we use the other arc generator that has been built only for that
                var posC = outerArc.centroid(d); // Label position = almost the same as posB
                var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2 // we need the angle to see if the X position will be at the extreme right or extreme left
                posC[0] = radius * 0.95 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
                return [posA, posB, posC]
            })
            .each(function(d) {
                this._current = d;
            });

    polyline = svg
        .select(".lines")
        .selectAll("polyline")
        .data(pie(is), key);

    polyline
        .transition()
        .duration(duration)
        .style("opacity", function(d) {
            return d.data.value == 0 ? 0 : .5;
        })
        .attrTween("points", function(d){
            this._current = this._current;
            var interpolate = d3.interpolate(this._current, d);
            var _this = this;
            return function(t) {
                var d2 = interpolate(t);
                _this._current = d2;
                var pos = outerArc.centroid(d2);
                pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                return [arc.centroid(d2), outerArc.centroid(d2), pos];
            };			
        });

    polyline = svg.select(".lines").selectAll("polyline")
        .data(pie(data), key);

    polyline
        .exit().transition().delay(duration)
        .remove();
}