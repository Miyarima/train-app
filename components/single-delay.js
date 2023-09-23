export default class SingleDelay extends HTMLElement {
    static get observedAttributes() {
        return ['delay'];
    }

    get delay() {
        return JSON.parse(this.getAttribute("delay"));
    }

    connectedCallback() {
        const advertisedTime = new Date(this.delay.Advertised);
        const estimatedTime = new Date(this.delay.Expected);
        const advertisedTimeString = advertisedTime
            .toLocaleTimeString("sv-SE", {hour: "2-digit", minute: "2-digit"});
        const estimatedTimeString = estimatedTime
            .toLocaleTimeString("sv-SE", {hour: "2-digit", minute: "2-digit"});

        this.innerHTML = `
        <div class="delay">
            <h4 class="main-st">${this.delay.LocationName}</h4>
            <h4 class="sub-st">${this.delay.ToLocationName}</h4>
            <div class="status">
                <p class="status-text">Aviserad: ${advertisedTimeString}</p>
                <p class="status-text">Förväntad: ${estimatedTimeString}</p>
            </div>
        </div>
        `;
    }
}
