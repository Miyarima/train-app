import { baseUrl } from "../utils.js";

const delay = {
    getDelays: async function getDelays() {
        const response = await fetch(`${baseUrl}/delayed`);
        const result = await response.json();

        return result.data;
    }
};

export default delay;
