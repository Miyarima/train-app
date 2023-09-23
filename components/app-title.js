export default class AppTitle extends HTMLElement {
    constructor() {
        super();
        this.title = "";
    }

    static get observedAttributes() {
        return ["title"];
    }

    attributeChangedCallback(property, oldValue, newValue) {
        if (oldValue === newValue) { return; }
        this[property] = newValue;
    }

    connectedCallback() {
        this.innerHTML = `<h1>${this.title}</h1>`;
    }
}
