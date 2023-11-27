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
        const playlists = JSON.parse(sessionStorage.playlists);
    }

    static get observedAttributes() {
        return [];
    }

}

customElements.define('playlist-select', PlaylistSelect);