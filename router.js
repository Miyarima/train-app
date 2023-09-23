export default class Router extends HTMLElement {
    constructor() {
        super();

        this.currentRoute = "";
        this.wildCard = "";

        this.allRoutes = {
            "": {
                view: "<delay-view></delay-view>",
                name: "Departures",
                icon: "departure",
            },
            "map": {
                view: "<map-view></map-view>",
                name: "Train overview map",
                icon: "map",
            },
            "favorites": {
                view: "<favorites-view></favorites-view>",
                name: "favorites",
                icon: "heart",
            },
            "login": {
                view: "<login-view></login-view>",
                name: "login",
                icon: "",
                hidden: true,
            },
            "visit": {
                view: "<visit-view></visit-view>",
                name: "Stations within distance",
                icon: "walking",
            },
        };
    }

    get routes() {
        return this.allRoutes;
    }

    connectedCallback() {
        window.addEventListener('hashchange', () => {
            this.resolveRoute();
        });

        this.resolveRoute();
    }

    resolveRoute() {
        let cleanHash = location.hash.replace("#", "");

        this.wildCard = "";

        if (cleanHash.indexOf("/") > -1) {
            let splittedHash = cleanHash.split("/");

            cleanHash = splittedHash[0];
            this.wildCard = splittedHash[1];
        }

        this.currentRoute = cleanHash;

        this.render();
    }

    render() {
        let html = "<not-found></not-found>";

        if (this.routes[this.currentRoute]) {
            html = this.routes[this.currentRoute].view;
            if (this.wildCard) {
                html = html.replace("$wildvard", this.wildCard);
            }
        }

        this.innerHTML = html;
    }
}
