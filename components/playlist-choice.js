class PlaylistChoice extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open'});
    }
}

customElements.define('playlist-choice', PlaylistChoice);