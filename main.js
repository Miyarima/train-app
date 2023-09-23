// GENERAL
import Router from "./router.js";
customElements.define('router-outlet', Router);

import Navigation from "./navigation.js";
customElements.define('navigation-outlet', Navigation);

import AppTitle from "./components/app-title.js";
customElements.define('app-title', AppTitle);

// DELAY PAGE
import DelayView from "./views/delay.js";
customElements.define("delay-view", DelayView);

import DelayList from "./components/delay-list.js";
customElements.define("delay-list", DelayList);

import SingleDelay from "./components/single-delay.js";
customElements.define("single-delay", SingleDelay);

// TRAIN MAP PAGE
import MapView from "./views/map.js";
customElements.define("map-view", MapView);

import TrainMap from "./components/train-map.js";
customElements.define("train-map", TrainMap);

// LOGIN PAGE
import LoginView from "./views/login.js";
customElements.define("login-view", LoginView);

import LoginForm from "./components/login-form.js";
customElements.define("login-form", LoginForm);

// FAVORITES PAGE
import FavoritesView from "./views/favorites.js";
customElements.define("favorites-view", FavoritesView);

import FavoritesForm from "./components/favorites-form.js";
customElements.define("favorites-form", FavoritesForm);

// VISIT PAGE
import VisitView from "./views/visit.js";
customElements.define("visit-view", VisitView);

import VisitMap from "./components/visit-map.js";
customElements.define("visit-map", VisitMap);
