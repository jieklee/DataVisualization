function mapvar() {
    return {
        // 1
        stack: {
            xvar: "Publisher",
            yvar: ["North America", "Europe", "Japan", "Rest of World"],
            beforefilter: {
                method: BEFOREFILTER.SUM,
                vara: "Global",
            }
        },
        box: {
            xvar: "Platform",
            yvar: "Global",
            beforefilter: {
                method: BEFOREFILTER.SUM,
                vara: "Global",
            }
        },
        // 2
        donut: {
            xvar: "Publisher",
            beforefilter: {
                method: BEFOREFILTER.COUNT,
                vara: "Publisher",
            }
        },
        // 3
        cloud: {
            xvar: "Game Title",
            yvar: "Review",
            beforefilter: {
                method: BEFOREFILTER.SUM,
                vara: "Review",
            }
        },
        // 4
        line: {
            xvar: "Year",
            yvar: "Publisher",
            beforefilter: {
                method: BEFOREFILTER.COUNT,
                vara: "Publisher",
            }
        },
        // 5
        heat: {
            xvar: "Publisher",
            yvar: "Genre",
        },
        // 6
        tree: {
            groupvar: "Publisher",
            opacityvar: "Review",
            h1var: "Game Title",
            h2var: "Global"
        },
        // 7
        rigidline: {
            xvar: "Year",
            yvar: "Platform"
        },
        // 8
        scatter: {
            xvar: "Review",
            yvar: "Global",
            colorvar: "Genre",
            sizevar: "Global",
            beforefilter: {
                method: BEFOREFILTER.SUM,
                vara: "Global",
            }
        },
        violin: {
            xvar: "Publisher",
            yvar: "Global",
            beforefilter: {
                method: BEFOREFILTER.SUM,
                vara: "Global",
            }
        },
    };
}

function setPresets() {
    setDropdown(mapvar.stack.xvar,'stackxvariable');
    var stackfiltervar = {
        vara: mapvar.stack.xvar, 
        type: FILTERTYPE.TOP, 
        value: 10, 
        beforefilter: mapvar.stack.beforefilter,
    }
    d3.select("#stacksort").property("checked", true);
    setLDynamicTfPreset('stackdata',stackfiltervar);
    stackfilter(true);
    
    // top 10 donut
    var donutfiltervar = {
            vara: mapvar.donut.xvar, 
            type: FILTERTYPE.TOP, 
            value: 10, 
            beforefilter: mapvar.donut.beforefilter,
        }
    setDropdown(mapvar.donut.xvar,'donutxvariable');
    setLDynamicTfPreset('donutdata',donutfiltervar);
    donutfilter(true);

    // top 10 cloud	
    var cloudfiltervar = {
            vara: "Publisher", 
            type: FILTERTYPE.EQUAL, 
            value: "Nintendo", 
        }
    setDropdown(mapvar.cloud.xvar,'cloudxvariable');
    setDropdown(mapvar.cloud.yvar,'cloudyvariable');
    setLDynamicTfPreset('clouddata',cloudfiltervar);
    cloudfilter(true);

    var linefiltervar = {
            vara: mapvar.line.yvar, 
            type: FILTERTYPE.TOP, 
            value: 10, 
            beforefilter: mapvar.line.beforefilter,
        }
    setDropdown(mapvar.line.xvar,'linexvariable');
    setDropdown(mapvar.line.yvar,'lineyvariable');
    d3.select("#lineparallel").property("checked", true);
    setLDynamicTfPreset('linedata',linefiltervar);
    linefilter(true);

    var heatfiltervar = {
            vara: "Global", 
            type: FILTERTYPE.GREATEROREQUAL, 
            value: 5, 
        }
    setDropdown(mapvar.heat.xvar,'heatxvariable');
    setDropdown(mapvar.heat.yvar,'heatyvariable');
    setLDynamicTfPreset('heatdata',heatfiltervar);
    heatfilter(true);

    var treefiltervar = {
        vara: mapvar.tree.opacityvar, 
        type: FILTERTYPE.TOP, 
        value: 100, 
    }
    setDropdown(mapvar.tree.groupvar,'treegroupvariable');
    setDropdown(mapvar.tree.opacityvar,'treeopacityvariable');
    setDropdown(mapvar.tree.h1var,'treeh1variable');
    // setDropdown(mapvar.tree.h2var,'treeh2variable');
    setLDynamicTfPreset('treedata',treefiltervar);
    treefilter(true);
    
    // var rigidlinefiltervar = {
    // 		vara: mapvar.rigidline.yvar, 
    // 		type: FILTERTYPE.TOP, 
    // 		value: 10, 
    // 	}
    setDropdown(mapvar.rigidline.xvar,'rigidlinexvariable');
    setDropdown(mapvar.rigidline.yvar,'rigidlineyvariable');
    // setLDynamicTfPreset('rigidlinedata',rigidlinefiltervar);
    rigidlinefilter(true);

    var scatterfiltervar = {
    		vara: 'Rank', 
    		type: FILTERTYPE.TOP, 
    		value: 100, 
    	}
    d3.select("#scatterenablesize").property("checked", false);
    d3.select("#scatterenablecolor").property("checked", true);
    setDropdown(mapvar.scatter.xvar,'scatterxvariable');
    setDropdown(mapvar.scatter.yvar,'scatteryvariable');
    setDropdown(mapvar.scatter.colorvar,'scattercolorvariable');
    setDropdown(mapvar.scatter.sizevar,'scattersizevariable');
    setLDynamicTfPreset('scatterdata',scatterfiltervar);
    scatterfilter(true);
}


function dataFilter(source) {
    var temp = getLDynamicTf(source);
    if(isNumeric(temp.value)) {
        temp.value = parseFloat(temp.value)
    }

    var data
    if(source == "maindata") {
        data = JSON.parse(localStorage.getItem("oridata"));
    } else {
        data = dataFilter("maindata");
    }

    success  = [];
    wrong = [];
    temp.forEach((element,index) => {
        if(element.type == "None" || element.vara == "None" || element.value == "") {
            wrong.push(index);
        } else if((element.type == ">" || element.type == "<" || element.type == "<=" || element.type == ">=") &&
        (element.value == "Game Title" || element.value == "Platform" || element.value == "Genre" || element.value == "Publisher")) {
            wrong.push(index);
        } else if(element.beforefilter.method == "None" || element.beforefilter.method == "None") {
            delete element.beforefilter;
        }
        if(wrong[wrong.length-1] != index) {
            data = lWhere([element], data);
            success.push(
                (success.length == 0 ? "Where " : "then ") + 
                element.vara+" is "+element.type+" "+element.value +
                (element.beforefilter ? " after "+element.beforefilter.method+" "+element.beforefilter.vara : "")
            )
        } else {
            wrong[wrong.length-1] = "line " + (wrong[wrong.length-1]+1) + " error";
        }
    });
    if(source == "maindata") {
        if(!(success.length == 0 && temp.length == 1)) {
            document.getElementById("maindatatext").innerHTML = success.join("<br/>") + "<br/>" + wrong.join("<br/>");
        } else {
            document.getElementById("maindatatext").innerHTML = "full";
        }
    }
    return data;
}

function mainDataFilter() {
    dataFilter('maindata');
    stackfilter(false);
    donutfilter(false);
    cloudfilter(false);
    linefilter(false);
    heatfilter(false);
    treefilter(false);
    rigidlinefilter(false);
    scatterfilter(false);
}

function stackfilter(isfirsttime) {
    var stackxvar = getDropdown("stackxvariable");
    var stackyvar = $("input[name='stackyvariable[]']:checked")
    .map(function(){return $(this).val();}).get();
    
    // d3.select("#stack-area > *").remove();
    data = dataFilter("stackdata");
    
    if(isfirsttime) {
        stack(data, {xvar:stackxvar.trim(), yvar:stackyvar});
    } else {
        stackchange(data, {xvar:stackxvar.trim(), yvar:stackyvar});
    }
    document.getElementById("stackname").innerHTML = stackxvar + "market share";
}

function donutfilter(isfirsttime) {
    var donutxvariable = getDropdown("donutxvariable");
    // d3.select("#donut-area > *").remove();
    data = dataFilter("donutdata");
    if(isfirsttime) {
        donutGraph(data, {xvar:donutxvariable.trim()});
    } else {
        donutGraphChange(data, {xvar:donutxvariable.trim()});
    }
    document.getElementById("donutname").innerHTML = "Number of games under " + donutxvariable;
}

function cloudfilter(isfirsttime) {
    var cloudxvariable = getDropdown("cloudxvariable");
    var cloudyvariable = getDropdown("cloudyvariable");
    // d3.select("#cloud-area > *").remove();
    data = dataFilter("clouddata");
    if(isfirsttime) {
        cloud(data, {xvar:cloudxvariable.trim(), yvar:cloudyvariable.trim()});	
    } else {
        cloudChange(data, {xvar:cloudxvariable.trim(), yvar:cloudyvariable.trim()});	
    }
    // cloud(data, {xvar:cloudxvariable.trim(), yvar:cloudyvariable.trim()});	
    document.getElementById("cloudname").innerHTML = "Most popular " + cloudxvariable + "according " + cloudyvariable;
}

function linefilter(isfirsttime) {
    var linexvariable = getDropdown("linexvariable");
    var lineyvariable = getDropdown("lineyvariable");
    // d3.select("#line-area > *").remove();
    data = dataFilter("linedata");
    if(isfirsttime) {
        line(data, {xvar:linexvariable.trim(), yvar:lineyvariable.trim()});	
    } else {
        lineChange(data, {xvar:linexvariable.trim(), yvar:lineyvariable.trim()});	
    }
    // line(data, {xvar:linexvariable.trim(), yvar:lineyvariable.trim()});	
    document.getElementById("linename").innerHTML = "Number of titles published by " + lineyvariable + "each " + linexvariable;
}

function heatfilter(isfirsttime) {
    var heatxvariable = getDropdown("heatxvariable");
    var heatyvariable = getDropdown("heatyvariable");
    // d3.select("#heat-area > *").remove();
    data = dataFilter("heatdata");
    if(isfirsttime) {
        heat(data, {xvar:heatxvariable.trim(), yvar:heatyvariable.trim()});	
    } else {
        heatChange(data, {xvar:heatxvariable.trim(), yvar:heatyvariable.trim()});	
    }
    // heat(data, {xvar:heatxvariable.trims(), yvar:heatyvariable.trim()});	
    document.getElementById("heatname").innerHTML = "Variability of Games produced by " + heatxvariable;
}

function treefilter(isfirsttime) {
    var treegroupvariable = getDropdown("treegroupvariable");
    var treeopacityvariable = getDropdown("treeopacityvariable");
    var treeh1variable = getDropdown("treeh1variable");
    // var treeh2variable = getDropdown("treeh2variable");
    // d3.select("#tree-area > *").remove();
    data = dataFilter("treedata");
    if(isfirsttime) {
        tree(data, {
            groupvar:treegroupvariable.trim(), 
            opacityvar:treeopacityvariable.trim(),
            h1var:treeh1variable.trim(), 
            // h2var:treeh2variable.trim(),
        });	
    } else {
        treeChange(data, {
            groupvar:treegroupvariable.trim(), 
            opacityvar:treeopacityvariable.trim(),
            h1var:treeh1variable.trim(), 
            // h2var:treeh2variable.trim(),
        });	
    }
    document.getElementById("treename").innerHTML = "Quality of games publish by " + treegroupvariable;
}

function rigidlinefilter(isfirsttime) {
    var rigidlinexvariable = getDropdown("rigidlinexvariable");
    var rigidlineyvariable = getDropdown("rigidlineyvariable");
    // d3.select("#rigidline-area > *").remove();
    data = dataFilter("rigidlinedata");
    if(isfirsttime) {
        rigidline(data, {xvar:rigidlinexvariable.trim(), yvar:rigidlineyvariable.trim()});	
    } else {
        rigidlineChange(data, {xvar:rigidlinexvariable.trim(), yvar:rigidlineyvariable.trim()});		
    }
    document.getElementById("rigidlinename").innerHTML = "Trend of " + rigidlineyvariable;
}

function scatterfilter(isfirsttime) {
    var scatterxvariable = getDropdown("scatterxvariable");
    var scatteryvariable = getDropdown("scatteryvariable");
    var scattercolorvariable = getDropdown("scattercolorvariable");
    var scattersizevariable = getDropdown("scattersizevariable");
    // d3.select("#scatter-area > *").remove();    
    data = dataFilter("scatterdata");
    if(isfirsttime) {
        scatter(data, {
            xvar:scatterxvariable.trim(), 
            yvar:scatteryvariable.trim(), 
            colorvar: scattercolorvariable.trim(),
            sizevar: scattersizevariable.trim()
        });	
    } else {
        scatterChange(data, {
            xvar:scatterxvariable.trim(), 
            yvar:scatteryvariable.trim(), 
            colorvar: scattercolorvariable.trim(),
            sizevar: scattersizevariable.trim()
        });	
    }
    document.getElementById("scattername").innerHTML = "Relationship between " + scatterxvariable + "and " + scatteryvariable;
}