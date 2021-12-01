
class LDropDown extends HTMLElement {
    connectedCallback() {
      var selection =this.getAttribute("selection")
      selection = ""
      var classname = this.getAttribute("classname")
      JSON.parse(this.getAttribute("selection")).forEach(element => {
        selection = selection + `<a class="dropdown-item" onclick="setDropdown(this.innerHTML,'${classname}');">${element}</a>`
      });
      this.innerHTML = `<div class="dropdown" style="display:inline;">
        ${this.getAttribute("label") ? `<label>`+ this.getAttribute("label") + `</label>` : `<label/>`}
          <button class="`+this.getAttribute("classname")+` btn btn-sm btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            `+
            JSON.parse(this.getAttribute("selection"))[0]
          +`
          </button>
          <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
          `+
          selection
          +`
          </div>
      </div>`;
  }
}

function setDropdown(val,classname) {
  var y = document.getElementsByClassName(classname);
  var aNode = y[0].innerHTML = val + ' <span class="caret"></span>'; // Append 
} 

function getDropdown(classname) {
  var y = document.getElementsByClassName(classname);
  return y[0].innerText;
}
customElements.define('l-dropdown', LDropDown);