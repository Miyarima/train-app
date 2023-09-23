import delayModel from "../models/delay.js";
import stationModel from "../models/stations.js";
import authModel from "../models/auth.js";

export default class DelayList extends HTMLElement {
    constructor() {
        super();

        this.delays = [];
        this.stations = [];
        this.matches = [];
        this.favorites = [];
    }

    async connectedCallback() {
        this.delays = await delayModel.getDelays();
        this.stations = await stationModel.getStations();

        this.extractData();

        if (authModel.token) {
            const favorites = await authModel.getData();

            this.favorites = favorites.data[0].artefact;
            this.extractData();
        }

        this.render();
    }

    extractData() {
        this.matches = this.delays.filter((delay) =>
            delay.FromLocation && delay.FromLocation[0].LocationName)
            .map((delay) => {
                const toLocationName = this.stations.find((station) =>
                    station.LocationSignature === delay.ToLocation[0].LocationName)
                    .AdvertisedLocationName;
                const station = this.stations.find((station) =>
                    station.LocationSignature === delay.FromLocation[0].LocationName);

                return {
                    "LocationName": station.AdvertisedLocationName,
                    "Advertised": delay.AdvertisedTimeAtLocation,
                    "Expected": delay.EstimatedTimeAtLocation,
                    "ToLocationName": toLocationName,
                };
            });

        if (this.favorites.length !== 0) {
            const objectString = this.favorites;
            const object = JSON.parse(objectString);
            const valuesArray = Object.values(object);
            let favoriteMatches = [];

            this.matches.forEach(item => {
                const locationName = item.LocationName;

                if (valuesArray.includes(locationName)) {
                    favoriteMatches.push(item);
                }
            });

            if (favoriteMatches.length !== 0) {
                this.matches = favoriteMatches;
            } else {
                this.matches = [{
                    "LocationName": "Inga försenade tåg hittades",
                    "Advertised": "2000-01-01T00:00:00.000",
                    "Expected": "2000-01-01T00:00:00.000",
                    "ToLocationName": "Lägg till fler stationer"
                }];
            }
        }
    }

    render() {
        const list = this.matches.map((match) => {
            return `<single-delay delay='${JSON.stringify(match)}'>
                        </single-delay>`;
        }).join("");

        this.innerHTML = `${list}`;
    }
}
