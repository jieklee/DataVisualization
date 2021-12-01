var converter = function(d) {
	// if(!regions.includes(d.Region)) {
	// 	regions.push(d.Region);
	// }
	return {
		// Rank,Game Title,Platform,Year,Genre,Publisher,North America,Europe,Japan,Rest of World,Global,Review
		Rank: parseFloat(d.Rank),
		"Game Title": d["Game Title"],
		Platform: d.Platform,
		Year: parseFloat(d.Year),
		Genre: d.Genre,
		Publisher: d.Publisher,
		"North America": parseFloat(d["North America"]),
		Europe: parseFloat(d.Europe),
		Japan: parseFloat(d.Japan),
		"Rest of World": parseFloat(d["Rest of World"]),
		Global: parseFloat(d.Global),
		Review: parseFloat(d.Review),
	}
}

function isNumeric(num){
	return !isNaN(num)
}

const TYPE = {
	ARRAY: "array",
	STRING: "string",
	OBJECT: "object",
	OTHER: "other"
};

function getType(p) {
    if (Array.isArray(p)) return TYPE.ARRAY;
    else if (typeof p == 'string') return TYPE.STRING;
    else if (p != null && typeof p == 'object') return TYPE.OBJECT;
    else return TYPE.OTHER;
}

// {
// 	type: "A-Z","Z-A", "descending", "ascending", "custom";
// 	vara: "value", key,"Publisher";
// }
// sort object will come out different structure

const SORTTYPE = {
	ASC: "ascending",
	DESC: "descending",
	ATOZ: "A-Z",
	ZTOA: "Z-A",
}

var lSort = function(para,data) {
	var type = getType(data);
	if(type == TYPE.OBJECT) {
		if(para.vara == FILTERVARA.VALUE) {
			if(para.type == SORTTYPE.ASC) {
				data = Object.entries(data).sort((a,b) => a[1]-b[1])
			}  else if(para.type == SORTTYPE.DESC) {
				data = Object.entries(data).sort((a,b) => b[1]-a[1])
			} else if(para.type == SORTTYPE.ATOZ) {

			}
			else if(para.type == SORTTYPE.ZTOA) {
		
			}
		}
	}
	return data;
}

// {
// 	type: [">","<","<=",">=", "==", "top", "last"];
// 	vara: ["index", "value","Publisher"];
// 	value: [1,2,3]
// 	beforefilter: ["sum","avg"]
// }

// just for lWhere
const FILTERTYPE = {
	GREATER: ">",
	GREATEROREQUAL: ">=",
	LESSER: "<",
	LESSEROREQUAL: "<=",
	EQUAL:"==",
	NOTEQUAL: "!=",
	TOP: "top",
	LAST: "last",
}

const FILTERVARA = {
	INDEX: "index",
	VALUE: "value"
}

const BEFOREFILTER = {
	SUM: "sum",
	COUNT: "count",
}

function lEval(vara, operator, value) {
	if(getType(vara) == TYPE.STRING) {
		vara = '"' + vara + '"';
	}
	if(getType(value) == TYPE.STRING) {
		value = '"' + value + '"';
	}
	return eval(vara+operator+value);
}

// // donutdata = lWhere([{type: ">", vara: "value", value: 70}], donutdata);
const lWhere = (para,data) => {
	if(!data || !para) {
		console.log("not enough var to run");
		return;
	}
	para.forEach(p => {
		var oridata;
		p.vara = p.vara.trim();
		p.type = p.type.trim();

		if(p.vara == "Rank" && p.type == FILTERTYPE.TOP) {
			p.type = FILTERTYPE.LAST;
		} else if(p.vara == "Rank" && p.type == FILTERTYPE.LAST) {
			p.type = FILTERTYPE.TOP;
		}
		
		if(p.beforefilter) {
			p.beforefilter.vara = p.beforefilter.vara.trim();
			oridata = data;
			data = d3.nest()
				.key((d) => d[p.vara])
				.rollup((leaves) => {
					if(p.beforefilter.method == BEFOREFILTER.SUM) {
						return d3.sum(leaves, (d) => d[p.beforefilter.vara]);
					} else if(p.beforefilter.method == BEFOREFILTER.COUNT) {
						return leaves.length;
					}
				})
				.entries(data);
			data.forEach( d => {
				d[p.vara] = d["value"];
				delete d["value"];
			});
		}
		var datatype = getType(data);
		if(datatype == TYPE.OBJECT) {
			if (p.type == FILTERTYPE.TOP || p.type == FILTERTYPE.LAST) {
				if(p.vara == FILTERVARA.VALUE) {
					data = Object.assign(                      // collect all objects into a single obj
						...Object                                // spread the final array as parameters
							.entries(data)                     // key a list of key/ value pairs
							.sort(({ 1: a }, { 1: b }) => p.type == FILTERTYPE.TOP ? b - a : a - b) // sort DESC by index 1 b - a = desc, a-b = asc
							.slice(0, p.value)                         // get first three items of array
							.map(([k, v]) => ({ [k]: v }))       // map an object with a destructured
					);
				}
			} else {
				if(p.type == FILTERTYPE.GREATER) {
					p.type = FILTERTYPE.GREATEROREQUAL
				} else if(p.type == FILTERTYPE.GREATEROREQUAL) {
					p.type = FILTERTYPE.GREATER
				} else if(p.type == FILTERTYPE.LESSER) {
					p.type = FILTERTYPE.LESSEROREQUAL
				} else if(p.type == FILTERTYPE.LESSEROREQUAL) {
					p.type = FILTERTYPE.LESSER
				} else if(p.type == FILTERTYPE.EQUAL) {
					p.type = FILTERTYPE.NOTEQUAL
				} else if(p.type == FILTERTYPE.NOTEQUAL) {
					p.type = FILTERTYPE.EQUAL
				}
				if(p.vara == FILTERVARA.INDEX) {
					Object.keys(data).forEach((k,i) => lEval(p.value, p.type, i) && delete data[k]);
				} else if(p.vara == FILTERVARA.VALUE) {
					Object.keys(data).forEach((k) => lEval(p.value, p.type, data[k]) && delete data[k]);
				}
			}  
		} else if(data[0] && datatype == TYPE.ARRAY && getType(data[0]) == TYPE.OBJECT) {
			if(p.type == FILTERTYPE.TOP || p.type == FILTERTYPE.LAST) {
				data = data.sort(
					(a, b) => 
						p.type == FILTERTYPE.TOP ? 
							b[p.vara] - a[p.vara] 
						: 
							a[p.vara] - b[p.vara]
					).slice(0, p.value);
			} else {
				data = data.filter(function (d,i) {
					if(p.vara == FILTERVARA.INDEX) {
						return lEval(i, p.type, p.value);
					}
					return lEval(d[p.vara], p.type, p.value);
				});
			}
		}

		if(p.beforefilter) {
			var varas = d3.map(data, (d) =>  d.key).keys();
			data = oridata.filter((d) => varas.includes(d[p.vara]+""));
		}
	});
	return data;
}

