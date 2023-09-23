import { apiKey, authUrl } from "../utils.js";

const auth = {
    token: "",

    login: async function login(username, password) {
        const user = {
            email: username,
            password: password,
            api_key: apiKey
        };

        const response = await fetch(`${authUrl}login`, {
            body: JSON.stringify(user),
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
        });
        const result = await response.json();

        if ("errors" in result) {
            return result.errors.detail;
        }

        auth.token = result.data.token;

        const dataCheck = await this.getData();

        if (dataCheck.data.length === 0) {
            const addData = {
                artefact: "{}",
                api_key: apiKey
            };

            await fetch(`${authUrl}data`, {
                body: JSON.stringify(addData),
                headers: {
                    "Content-Type": "application/json",
                    "x-access-token": auth.token,
                },
                method: "POST",
            });
        }

        return "ok";
    },

    register: async function register(username, password) {
        const user = {
            email: username,
            password: password,
            api_key: apiKey
        };

        const response = await fetch(`${authUrl}register`, {
            body: JSON.stringify(user),
            headers: {
                "Content-Type": "application/json",
            },
            method: "POST",
        });
        const result = await response.json();

        if ("errors" in result) {
            return "not ok";
        }

        return "ok";
    },

    getData: async function getData() {
        const response = await fetch(`${authUrl}data?api_key=${apiKey}`, {
            headers: {
                "Content-Type": "application/json",
                "x-access-token": auth.token,
            },
            method: "GET",
        });
        const result = await response.json();

        if ("errors" in result) {
            return "not ok";
        }

        return result;
    },

    addData: async function addData(id, artefact, newFavorite) {
        let object = artefact;
        const objectLength = Object.keys(object).length;

        object[`${objectLength+1}`] = newFavorite;

        let updatedJsonString = JSON.stringify(object);
        const user = {
            id: id,
            artefact: updatedJsonString,
            api_key: apiKey
        };

        const response = await fetch(`${authUrl}data`, {
            body: JSON.stringify(user),
            headers: {
                "Content-Type": "application/json",
                "x-access-token": auth.token,
            },
            method: "PUT",
        });

        if (response.status === 204) {
            return "ok";
        }

        return "not ok";
    },
};

export default auth;
