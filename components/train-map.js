/* global L */

import "../leaflet/leaflet.min.js";
import "../leaflet/leaflet.markercluster.min.js";

import "../lib/leaflet-heat.js";

import stationModel from "../models/stations.js";
import delayModel from "../models/delay.js";

export default class MapLocation extends HTMLElement {
    constructor() {
        super();

        this.delays = [];
        this.stations = [];
        this.matches = [];
        this.data = [];
        this.map = null;
        this.position = {};
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

    async connectedCallback() {
        this.delays = await delayModel.getDelays();
        this.stations = await stationModel.getStations();
        this.extractData();
        this.formatData();
        const currentDate = new Date();
        const currentTime = currentDate.toLocaleTimeString();

        this.innerHTML = `
        <div id="map" class="map"></div>
        <p class="map-text">Tågstationens läge är en approximation</p>
        <p class="map-text">Senast uppdaterad: ${currentTime}</p>
        `;
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

        this.renderMarkers();
        this.renderLocation();
        this.renderHeatmap();
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

    renderHeatmap() {
        let delays = [];

        for (let i = 0; i < this.data.length; i++) {
            this.data[i].stations.forEach(element => {
                let geo = [
                    parseFloat(element.Geo[1]),
                    parseFloat(element.Geo[0]),
                    0.7
                ];

                delays.push(geo);
            });
        }
        L.heatLayer(delays, {radius: 40}).addTo(this.map);
    }
}
