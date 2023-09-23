import { createLabel, createInput, createButton, toast } from "../utils.js";
import authModel from "../models/auth.js";

export default class LoginForm extends HTMLElement {
    constructor() {
        super();
        this.credentials = [];
    }

    async login() {
        const result = await authModel.login(
            this.credentials.username,
            this.credentials.password,
        );

        if (result === "ok") {
            location.hash = "favorites";
        } else {
            toast(`⚠️ ${result}`);
        }
    }

    async register() {
        const result = await authModel.register(
            this.credentials.username,
            this.credentials.password,
        );

        if (result === "ok") {
            this.login();
        } else {
            toast(`⚠️ User already exists`);
        }
    }

    connectedCallback() {
        this.render();
    }

    render() {
        let form = document.createElement('form');

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            this.login();
        });

        let usernameLabel = createLabel('Username');
        let username = createInput('email');

        username.addEventListener('input', (event) => {
            this.credentials = {
                ...this.credentials,
                username: event.target.value
            };
        });

        let passwordLabel = createLabel('Password');
        let password = createInput('password');

        password.addEventListener('input', (event) => {
            this.credentials = {
                ...this.credentials,
                password: event.target.value
            };
        });

        let loginButton = createButton('Logga in');
        let registerButton = document.createElement('input');

        loginButton.classList.add('button', 'button-margin');
        registerButton.setAttribute('value', 'Registrera användare');
        registerButton.classList.add('button', 'button-margin');

        registerButton.addEventListener('click', (event) => {
            event.preventDefault();
            this.register();
        });

        form.appendChild(usernameLabel);
        form.appendChild(username);
        form.appendChild(passwordLabel);
        form.appendChild(password);
        form.appendChild(loginButton);
        form.appendChild(registerButton);

        this.appendChild(form);
    }
}
