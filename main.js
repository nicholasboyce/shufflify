import './style.css'

import spotifyDataFetch from "./spotifyDataFetch.js"

const params = new URLSearchParams(window.location.search);
const code = params.get("code");
const denied = params.get("error");

const spotifyConnectBtn = document.querySelector('.spotify-connect');


const body = document.querySelector('body');
const header = document.querySelector('header');
const main = document.querySelector('main');

spotifyConnectBtn.addEventListener('click', async () => {
  await spotifyDataFetch();
});

if (denied) {
  window.location = '/';
}

if (code) {
  sessionStorage.setItem('code', code);
  window.location = '/playlists/';
}