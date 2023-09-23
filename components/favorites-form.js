import { createLabel, createInput, createButton, toast } from "../utils.js";
import authModel from "../models/auth.js";

export default class FavoritesForm extends HTMLElement {
    constructor() {
        super();
        this.credentials = [];
        this.json = [];
        this.artefact = {};
        this.newFavorite = "";
    }

    async getData() {
        const result = await authModel.getData();

        if (result === "not ok") {
            toast(`⚠️ Something went wrong`);
        } else {
            this.json = result;
        }
    }

    async addData() {
        const result = await authModel.addData(
            this.json.data[0].id,
            this.artefact,
            this.newFavorite
        );

        if (result === "not ok") {
            toast(`⚠️ Something went wrong`);
        } else {
            location.hash = "";
        }
    }

    async connectedCallback() {
        await this.getData();
        this.render();
    }

    render() {
        let form = document.createElement('form');

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            this.login();
        });

        let addFavorite = createLabel('Lägg till ny Favorit');
        let favorite = createInput('text');

        favorite.addEventListener('input', (event) => {
            this.newFavorite = event.target.value;
        });

        let addButton = createButton('Lägg Till');

        addButton.classList.add('button', 'button-margin');

        addButton.addEventListener('click', (event) => {
            event.preventDefault();
            this.addData();
        });

        const favoritesList = document.createElement('div');
        const content = document.createElement('p');
        const artefact = JSON.parse(this.json.data[0].artefact);

        this.artefact = artefact;

        favoritesList.classList.add('favorites');

        let dataString = "<h2>Nuvarade Favoriter</h2>";

        for (let data in artefact) {
            dataString += `
                <p class="favorites-text">
                    <img class="icon" src="img/train.svg">
                    ${artefact[data]}
                </p>`;
        }

        content.innerHTML = `${dataString}`;

        form.appendChild(addFavorite);
        form.appendChild(favorite);
        form.appendChild(addButton);

        favoritesList.appendChild(content);

        this.appendChild(form);
        this.appendChild(favoritesList);
    }
}
