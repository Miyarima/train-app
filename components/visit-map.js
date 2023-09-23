/* global L */

import "../leaflet/leaflet.min.js";
import "../leaflet/leaflet.markercluster.min.js";

// import getCoordinates from "../models/nominatim.js";
import stationModel from "../models/stations.js";
import delayModel from "../models/delay.js";

export default class VisitMap extends HTMLElement {
    constructor() {
        super();

        this.delays = [];
        this.stations = [];
        this.matches = [];
        this.data = [];
        this.map = null;
        this.position = {};
        this.accessible = [];
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
                const coords = station.Geometry['WGS84'].replace("POINT (", "")
                    .replace(")", "").split(" ");

                return {
                    "LocationName": station.AdvertisedLocationName,
                    "Geo": coords,
                    "Advertised": delay.AdvertisedTimeAtLocation,
                    "Expected": delay.EstimatedTimeAtLocation,
                    "ToLocationName": toLocationName,
                };
            });
    }

    formatData() {
        for (let obj of this.matches) {
            const { LocationName, ...rest } = obj;
            const existingData = this.data.find(item => item.LocationName === LocationName);

            if (existingData) {
                existingData.stations.push(rest);
            } else {
                const newStation = { LocationName, stations: [rest] };

                this.data.push(newStation);
            }
        }
    }

    getPosition() {
        return new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject);
        });
    }

    setHtml() {
        const currentDate = new Date();
        const currentTime = currentDate.toLocaleTimeString();

        this.innerHTML = `
        <div id="map" class="map"></div>
        <p class="map-text">Tågstationenerna du hinner till är en approximation</p>
        <p class="map-text">Senast uppdaterad: ${currentTime}</p>
        `;
    }

    distance(lat1, lon1, lat2, lon2) {
        const radius = 6371;

        const lat1Rad = this.toRadians(lat1);
        const lon1Rad = this.toRadians(lon1);
        const lat2Rad = this.toRadians(lat2);
        const lon2Rad = this.toRadians(lon2);

        const latDiff = lat2Rad - lat1Rad;
        const lonDiff = lon2Rad - lon1Rad;

        const a = Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
                    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                    Math.sin(lonDiff / 2) * Math.sin(lonDiff / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = radius * c;

        return distance;
    }

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    calculateDelay(estimatedTime) {
        const timeNow = new Date();
        const estimated = new Date(estimatedTime);

        const timeDiff = estimated - timeNow;
        const timeDiffMinutes = timeDiff / (1000 * 60);

        return timeDiffMinutes;
    }

    walkingDistance(distance, delay, from) {
        const mestersPerMinute = 100;

        delay.forEach(element => {
            const time = (distance * 1000) / mestersPerMinute;

            if ((element[0] / 2) - 1 > time) {
                this.accessible.push([from, element[1], element[2]]);
            }
        });
    }

    async calculateDistance() {
        const userPosition = await this.getPosition();
        let delay = [];

        for (let i = 0; i < this.data.length; i++) {
            let distance = this.distance(
                userPosition.coords.latitude,
                userPosition.coords.longitude,
                this.data[i].stations[0].Geo[1],
                this.data[i].stations[0].Geo[0]
            );

            this.data[i].stations.forEach(element => {
                delay.push([
                    this.calculateDelay(element.Expected),
                    element.ToLocationName,
                    element.Advertised
                ]);
            });

            this.walkingDistance(distance, delay, this.data[i].LocationName);
            delay = [];
        }

        let accessibleStations = [];

        this.data.forEach(element => {
            if (this.accessible.find(el => el[0] === element.LocationName)) {
                accessibleStations.push(element);
            }
        });

        let stationsWithinDistance = [];

        accessibleStations.forEach(e => {
            const obj = {};

            obj.LocationName = e.LocationName;
            let withinDistance = [];

            e.stations.forEach(el => {
                this.accessible.forEach(element => {
                    if (element[2] === el.Advertised) {
                        withinDistance.push(el);
                    }
                });
            });
            obj.stations = withinDistance;
            stationsWithinDistance.push(obj);
        });
        this.data = stationsWithinDistance;
    }

    async connectedCallback() {
        this.delays = await delayModel.getDelays();
        this.stations = await stationModel.getStations();
        this.extractData();
        this.formatData();
        this.setHtml();

        this.renderMap();
    }

    async renderMap() {
        this.position = await this.getPosition();
        const latitude = this.position.coords.latitude;
        const longitude = this.position.coords.longitude;

        this.map = L.map('map').setView([latitude, longitude], 8);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);

        this.renderLocation();
        await this.calculateDistance();
        this.renderMarkers();
    }

    async renderMarkers() {
        let markers = L.markerClusterGroup();
        let dataStr = "";

        for (let i = 0; i < this.data.length; i++) {
            const locationName = this.data[i].LocationName;
            const coords = this.data[i].stations[0].Geo;

            this.data[i].stations.forEach(element => {
                const advertisedTime = new Date(element.Advertised);
                const estimatedTime = new Date(element.Expected);
                const advertisedTimeString = advertisedTime
                    .toLocaleTimeString("sv-SE", {hour: "2-digit", minute: "2-digit"});
                const estimatedTimeString = estimatedTime
                    .toLocaleTimeString("sv-SE", {hour: "2-digit", minute: "2-digit"});

                dataStr += `
                <div class="train-margin-bottom">
                    <p class="no-margin">
                        <strong>${locationName} - ${element.ToLocationName}</strong>
                    </p>
                    <p class="no-margin">
                        Förväntas: 
                        <span class="strike">${advertisedTimeString}</span> 
                        ${estimatedTimeString}
                    </p>
                </div>
                `;
            });

            markers.addLayer(L.marker([
                coords[1],
                coords[0]
            ]).bindPopup(dataStr));
            dataStr = "";
        }

        this.map.addLayer(markers);
    }

    renderLocation() {
        let locationMarker = L.icon({
            iconUrl:      "leaflet/location.png",
            iconSize:     [24, 24],
            iconAnchor:   [12, 12],
            popupAnchor:  [0, 0]
        });

        L.marker(
            [this.position.coords.latitude, this.position.coords.longitude],
            {icon: locationMarker}
        ).addTo(this.map);
    }
}
