import hideNavModel from "../models/hideNav.js";

export default class VisitView extends HTMLElement {
    connectedCallback() {
        this.innerHTML =    `<header class="header">
                                <img class="show-btn" src="img/bars.svg">
                                <app-title title="Stockholm"></app-title>
                             </header>
                             <navigation-outlet></navigation-outlet>
                             <main class="main slide-in" id="slider">
                                <visit-map></visit-map>
                             </main>
                             `;
        hideNavModel.hidden();
    }
}
