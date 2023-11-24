
const code = sessionStorage.getItem("code");
const clientId = localStorage.getItem("client_id");


const body = document.querySelector('body');
const header = document.querySelector('header');
const main = document.querySelector('main');

if (code) {
  await getAccessToken(clientId, code);
  const accessToken = localStorage.getItem("access_token");
  await initialPageLoad(accessToken);
}

/* || Authentication */

async function getAccessToken(clientId, code) {
  const verifier = localStorage.getItem("verifier");
  const refresh = localStorage.getItem("refresh_token");

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  if (refresh !== null || refresh !== undefined)  {
      params.append("grant_type", "refresh_token");
      params.append("refresh_token", refresh);
  } else {
      params.append("grant_type", "authorization_code");
      params.append("code", code);
      params.append("redirect_uri", "http://localhost:5173");
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

/* || Page Building */

async function initialPageLoad(token) {
    const profile = await fetchProfile(token);
    const data = await fetchPlaylists(token);
    const playlists = data.items?.map((playlist) => ({
        name: playlist.name,
        uri: playlist.uri
    }));
    console.log(profile);
    if (profile.images.length > 0) {
        const profilePhoto = document.createElement('img');
        profilePhoto.src = profile.images.url;
        main.appendChild(profilePhoto);
    }
    console.log(playlists);
}