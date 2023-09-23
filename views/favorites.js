import authModel from "../models/auth.js";
import hideNavModel from "../models/hideNav.js";

export default class FavoritesView extends HTMLElement {
    connectedCallback() {
        if (!authModel.token) {
            location.hash = "login";
        }

        if (authModel.token) {
            this.render();
        }
    }

    render() {
        this.innerHTML =    `<header class="header">
                                <img class="show-btn" src="img/bars.svg">
                                <app-title title="DelayDetectives"></app-title>
                             </header>
                             <navigation-outlet></navigation-outlet>
                             <main class="main slide-in" id="slider">
                                <favorites-form></favorites-form>
                             </main>
                             `;
        hideNavModel.hidden();
    }
}
