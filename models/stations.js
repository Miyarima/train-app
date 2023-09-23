import { baseUrl } from "../utils.js";

const station = {
    getStations: async function getStations() {
        const response = await fetch(`${baseUrl}/stations`);
        const result = await response.json();

        return result.data;
    }
};

export default station;
