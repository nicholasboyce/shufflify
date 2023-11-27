import './style.css'

import connectToSpotify from "./connectToSpotify.js"

const params = new URLSearchParams(window.location.search);
const code = params.get("code");
const denied = params.get("error");

const spotifyConnectBtn = document.querySelector('.spotify-connect');

spotifyConnectBtn.addEventListener('click', async () => {
  await connectToSpotify();
});

if (denied) {
  window.location = '/';
}

if (code) {
  sessionStorage.setItem('code', code);
  window.location = '/playlists/';
}