import Router from "./router.js";

export default class Navigation extends HTMLElement {
    constructor() {
        super();

        this.router = new Router();
    }

    connectedCallback() {
        const routes = this.router.routes;

        let navigationLinks = "";

        for (let path in routes) {
            if (routes[path].hidden) {
                continue;
            }

            navigationLinks += `
            <a href='#${path}'>
                <img class="icon" src="img/${routes[path].icon}.svg">
                ${routes[path].name}
            </a>
            `;
        }

        this.innerHTML = `
            <nav class="side-nav hidden">
                ${navigationLinks}
            </nav>`;

        let links = document.querySelectorAll(".side-nav a");

        for (let i = 0; i < links.length; i++) {
            let link = links[i];

            link.addEventListener("click", (event) => {
                event.preventDefault();

                let currentActive = document.querySelector(".side-nav a.active");
                let nav = document.querySelector(".side-nav");
                let showBtn = document.querySelector(".show-btn");

                if (currentActive) {
                    currentActive.classList.remove("active");
                }
                event.target.classList.add("active");

                let slider = document.getElementById("slider");

                slider.classList.remove("slide-in");
                slider.classList.add("slide-out");
                nav.classList.add("hidden");

                setTimeout(() => {
                    slider.classList.remove("slide-out");
                    showBtn.setAttribute('src', 'img/bars.svg');

                    location.hash = link.hash.replace("#", "");
                }, 250);
            });
        }
    }
}
