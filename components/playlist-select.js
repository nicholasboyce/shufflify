const template = document.createElement('template');
template.innerHTML = `
    <style>
        form { font-size: 24px;}
    </style>
    <form>
        <label for="playlist-choice">Select your playlist:</label>
        <input list="playlist-options" id="playlist-choice" name="playlists" />

        <datalist>
            <option>Test 1</option>
            <option>Test 2</option>
        </datalist>
    </form>
    <button>
        +
    </button>
`

class PlaylistSelect extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open'});
        shadow.append(template.content.cloneNode(true));
    }

    connectedCallback() {
    }

    static get observedAttributes() {
        return [];
    }

    async fetchProfile(token) {
        const result = await fetch("https://api.spotify.com/v1/me", {
            method: "GET", headers: { Authorization: `Bearer ${token}` }
        });

        const profile = await result.json()

        return profile;
    }

    async fetchPlaylists(token) {
        const result = await fetch(`https://api.spotify.com/v1/me/playlists`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}`}
        });

        const playlists = await result.json();

        return playlists;
    } 


}

customElements.define('playlist-select', PlaylistSelect);