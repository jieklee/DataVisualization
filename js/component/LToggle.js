
class LToggle extends HTMLElement {
    connectedCallback() {
      var classname = this.getAttribute("classname")
      var label = this.getAttribute("label")
      var checked = this.getAttribute("checked")

      this.innerHTML = `
        <div class="custom-control custom-switch" style="display:inline;">
            <input type="checkbox" checked=${checked} class="custom-control-input ${classname}" id="${classname}">
            <label class="custom-control-label" for="${classname}">${label}</label>
        </div>`;
    }
}
  
customElements.define('l-toggle', LToggle);