import hideNavModel from "../models/hideNav.js";

export default class DelayView extends HTMLElement {
    connectedCallback() {
        this.innerHTML =    `<header class="header">
                                <img class="show-btn" src="img/bars.svg">
                                <app-title title="DelayDetectives"></app-title>
                             </header>
                             <navigation-outlet></navigation-outlet>
                             <main class="main slide-in" id="slider">
                                <delay-list></delay-list>
                             </main>
                             `;
        hideNavModel.hidden();
    }
}
