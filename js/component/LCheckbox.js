class LCheckbox extends HTMLElement {
    connectedCallback() {
        var classname = this.getAttribute("classname")
        var string = ""
        JSON.parse(this.getAttribute("selection")).forEach((element,i) => {
            string = string + `
                <div class="form-check form-check-inline">
                    <input class="form-check-input" type="checkbox" id="inlineCheckbox${i}" value="${element}" checked name="${classname}[]">
                    <label class="form-check-label for="inlineCheckbox${i}">${element}</label>
                </div>
            `
        });

        this.innerHTML = string;
    }
}
  
customElements.define('l-checkbox', LCheckbox);