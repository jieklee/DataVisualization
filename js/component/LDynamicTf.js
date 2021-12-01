class LDynamicTf extends HTMLElement {
    connectedCallback() {
        var classname = this.getAttribute("classname")
        var variableselection = ""
        JSON.parse(this.getAttribute("variableselection")).forEach(element => {
            variableselection = variableselection + `<a id="variableselection" class="dropdown-item ${classname+"variableselection-1"}"" onclick="setLDynamicTfDropdown(this.innerHTML,this);">${element}</a>`
        });
        var operatorselection = ""
        JSON.parse(this.getAttribute("operatorselection")).forEach(element => {
            operatorselection = operatorselection + `<a id="operatorselection" class="dropdown-item ${classname+"operatorselection-1"}"" onclick="setLDynamicTfDropdown(this.innerHTML,this);">${element}</a>`
        });

        var beforefilterselection = ""
        JSON.parse(this.getAttribute("beforefilterselection")).forEach(element => {
            beforefilterselection = beforefilterselection + `<a id="beforefilterselection" class="dropdown-item ${classname+"beforefilterselection-1"}"" onclick="setLDynamicTfDropdown(this.innerHTML,this);">${element}</a>`
        });

        var beforefiltervariableselection = ""
        JSON.parse(this.getAttribute("beforefiltervariableselection")).forEach(element => {
            beforefiltervariableselection = beforefiltervariableselection + `<a id="beforefiltervariableselection" class="dropdown-item ${classname+"beforefiltervariableselection-1"}"" onclick="setLDynamicTfDropdown(this.innerHTML,this);">${element}</a>`
        });

        this.innerHTML = `
            <div class="form-group" style="width: 100%;">
                <div class="row">
                    <label class="col-2 control-label" for="field1"  style="margin-top:16px;">
                        Where
                    </label>
                    <div class="col-10">
                        <div class="${classname}dynamic-wrap">
                            <form role="form" autocomplete="off">
                                <div class="${classname}entry input-group" style="margin-top:16px;">
                                    <div class="input-group-prepend">
                                        <button class="btn btn-outline-secondary dropdown-toggle ${classname+"variableselection-1"}" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">None</button>
                                        <div class="dropdown-menu">
                                            ${variableselection}
                                        </div>
                                    </div>
                                    <div class="input-group-prepend">
                                        <button class="btn btn-outline-secondary dropdown-toggle ${classname+"operatorselection-1"}" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">None</button>
                                        <div class="dropdown-menu">
                                            ${operatorselection}
                                        </div>
                                    </div>
                                    <input class="form-control" name="${classname}[]" type="text" placeholder="Type something" />
                                    <div class="input-group-prepend">
                                        <button class="btn btn-outline-secondary dropdown-toggle ${classname+"beforefilterselection-1"}" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">None</button>
                                        <div class="dropdown-menu">
                                            ${beforefilterselection}
                                        </div>
                                    </div>
                                    <div class="input-group-prepend">
                                        <button class="btn btn-outline-secondary dropdown-toggle ${classname+"beforefiltervariableselection-1"}" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">None</button>
                                        <div class="dropdown-menu">
                                            ${beforefiltervariableselection}
                                        </div>
                                    </div>
                                    <span class="input-group-btn">
                                        <button class="btn btn-success btn-add" type="button" value="100" style="width:40px">
                                            <span>+</span>
                                        </button>
                                    </span>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>`;

        function changeClassName(temp,regex,nentry) {
            var arrClasses = [];
            temp.removeClass(function () { // Select the element divs which has class that starts with some-class-
                var className;
                if(regex=="variableselection") {
                    className = this.className.match(/\S+(variableselection-)\d+/); //get a match to match the pattern some-class-somenumber and extract that classname
                } else if(regex == "operatorselection") {
                    className = this.className.match(/\S+(operatorselection-)\d+/);
                } else if(regex == "beforefilterselection") {
                    className = this.className.match(/\S+(beforefilterselection-)\d+/);
                } else if(regex == "beforefiltervariableselection") {
                    className = this.className.match(/\S+(beforefiltervariableselection-)\d+/);
                }
                if (className) {
                    arrClasses.push(className[0]); //if it is the one then push it to array
                    return className[0]; //return it for removal
                }
            })
            if(arrClasses.length >= 1) {
                temp.addClass(arrClasses[0].split("-")[0]+"-"+nentry)
            }
        }

        $(function() {
            $(document).on('click', '.btn-add', function(e) {
                e.preventDefault();

                var dynaForm = $('.'+classname+'dynamic-wrap form:last'),
                    currentEntry = $(this).parents('.'+classname+'entry:last'),
                    newEntry = $(currentEntry.clone()).appendTo(dynaForm);

                var nentry = $('.'+classname+'entry').length;

                var filtercomponent = (a,find,operator,value) => a.find(find).filter(function( index ) {
                    return eval(index+operator+value);
                });

                var temp = filtercomponent(newEntry,'button', '==',0);
                changeClassName(temp,"variableselection",nentry);

                var temp = filtercomponent(newEntry,'button', '==',1);
                changeClassName(temp,"operatorselection",nentry);

                var temp = filtercomponent(newEntry,'button', '==',2);
                changeClassName(temp,"beforefilterselection",nentry);

                var temp = filtercomponent(newEntry,'button', '==',3);
                changeClassName(temp,"beforefiltervariableselection",nentry);

                var temp = filtercomponent(newEntry,'a', '<', newEntry.find('#variableselection').length);
                changeClassName(temp,"variableselection",nentry);
                
                var temp = filtercomponent(newEntry,'a', '>=', newEntry.find('#variableselection').length);
                var temp = temp.slice(0,newEntry.find('#operatorselection').length);
                changeClassName(temp,"operatorselection",nentry);

                var temp = filtercomponent(newEntry,'a', '>=',newEntry.find('#variableselection').length+newEntry.find('#operatorselection').length);
                var temp = temp.slice(0,newEntry.find('#beforefilterselection').length);
                changeClassName(temp,"beforefilterselection",nentry);

                var temp = filtercomponent(newEntry,'a', '>=',newEntry.find('#variableselection').length+newEntry.find('#operatorselection').length+newEntry.find('#beforefilterselection').length);
                changeClassName(temp,"beforefiltervariableselection",nentry);

                newEntry.find('input').val('');
                newEntry.find('button:not(:last)').html('None');
                dynaForm.find('.'+classname+'entry:not(:last) .btn-add')
                    .removeClass('btn-add')
                    .addClass('btn-remove')
                    .removeClass('btn-success')
                    .addClass('btn-danger')
                    .html('<span>-</span>');
                }).on('click', '.btn-remove', function(e) {
                $(this).parents('.'+classname+'entry:first').remove();

                e.preventDefault();
                return false;
            });
        });
    }
}


function setLDynamicTfPreset(classname, variable) {
    var y = document.getElementsByClassName(classname+'variableselection'+"-"+ 1);
    $(y[0]).text(variable.vara)
    y = document.getElementsByClassName(classname+'operatorselection'+"-"+ 1);
    y[0].innerHTML = variable.type + ' <span class="caret"></span>';
    $("input[name='"+classname+"[]']").eq(0).val(variable.value);
    if(variable.beforefilter) {
        y = document.getElementsByClassName(classname+'beforefilterselection'+"-"+ 1);
        y[0].innerHTML = variable.beforefilter.method + ' <span class="caret"></span>';
        y = document.getElementsByClassName(classname+'beforefiltervariableselection'+"-"+ 1);
        y[0].innerHTML = variable.beforefilter.vara + ' <span class="caret"></span>';
    }
}

function getLDynamicTfDropdown(classname,selection,n) {
    var arr = [];
    var i= 1;
    while(n != arr.length) {
        var temp = document.getElementsByClassName(classname+selection+"-"+ i);
        if(temp.length >=1) {
            arr.push(temp[0].innerText)
        }
        i++;
    }
    return arr;
}

function setLDynamicTfDropdown(val,a) {
    a = $(a).attr('class').split(" ")[1];
    var y = document.getElementsByClassName(a);
    var aNode = y[0].innerHTML = val + ' <span class="caret"></span>'; // Append 
}

function getLDynamicTf(classname) {
    var nentry = $('.'+classname+'entry').length;
    var tfs = getDynamicTf(classname);
    var variableselections = getLDynamicTfDropdown(classname,'variableselection',nentry)
    var operatorselections = getLDynamicTfDropdown(classname,'operatorselection',nentry)
    var beforefilterselection = getLDynamicTfDropdown(classname,'beforefilterselection',nentry)
    var beforefiltervariableselection = getLDynamicTfDropdown(classname,'beforefiltervariableselection',nentry)
    a = [];
    for(var i=0; i<nentry; i++) {
        a.push(
            {
                vara: variableselections[i],
                type: operatorselections[i],
                value: tfs[i],
                beforefilter: {
                    method: beforefilterselection[i],
                    vara: beforefiltervariableselection[i],
                }
            }
        );
    }
    return a;
}

function getDynamicTf(classname) {
    var values = $("input[name='"+classname+"[]']")
        .map(function(){return $(this).val();}).get();
    return values;
}
  
customElements.define('l-dynamictf', LDynamicTf);