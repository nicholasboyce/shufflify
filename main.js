import './style.css'

import spotifyDataFetch from "./spotifyDataFetch.js"

const params = new URLSearchParams(window.location.search);
const code = params.get("code");
const clientId = localStorage.getItem("client_id");

const spotifyConnectBtn = document.querySelector('.spotify-connect');

localStorage.removeItem("access_token");
localStorage.removeItem("refresh_token");

spotifyConnectBtn.addEventListener('click', async () => {
  await spotifyDataFetch();
});

if (code) {
  await getAccessToken(clientId, code);
  const accessToken = localStorage.getItem("access_token");
  // const profile = await fetchProfile(accessToken);
  let data = await fetchPlaylists(accessToken);
  const playlists = data.items?.map((playlist) => ({
      name: playlist.name,
      uri: playlist.uri
  }));
  console.log(playlists);
}

/* || Authentication */

async function getAccessToken(clientId, code) {
  const verifier = localStorage.getItem("verifier");
  const refresh = localStorage.getItem("refresh_token");

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  if (refresh !== null) {
      params.append("grant_type", "refresh_token");
      params.append("refresh_token", refresh);
  } else {
      params.append("grant_type", "authorization_code");
      params.append("code", code);
      params.append("redirect_uri", "http://localhost:5173/callback");
      params.append("code_verifier", verifier);
  }

  const result = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params
  });

  const response = await result.json();

  localStorage.setItem("access_token", response.access_token);
  localStorage.setItem("refresh_token", response.refresh_token);
}

/* || Authentication */

/* || Initial Data Retrieval */

async function fetchProfile(token) {
  const result = await fetch("https://api.spotify.com/v1/me", {
    method: "GET", headers: { Authorization: `Bearer ${token}` }
  });

  const profile = await result.json()

  return profile;
}

async function fetchPlaylists(token) {
  const result = await fetch(`https://api.spotify.com/v1/me/playlists`, {
    method: "GET",
    headers: { Authorization: `Bearer ${token}`}
  });

  const playlists = await result.json();

  return playlists;
} 
/* || Initial Data Retrieval */