
const code = sessionStorage.getItem("code");
const clientId = localStorage.getItem("client_id");


const body = document.querySelector('body');
const header = document.querySelector('header');
const main = document.querySelector('main');

const states = ['select', 'review', 'complete']; //Possible states of app once logged in

sessionStorage.currState ??= states[0]; //Checks if currState is null/undefined - if so, set to states[0] 

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
  if (refresh !== "null" || refresh !== "undefined")  {
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
    loadTopOfPage(profile);
    const app = document.querySelector('.app');
    const instructions = document.querySelector('.instructions');

    switch(sessionStorage.currState) {
        case('select'):
            instructions.textContent = 'Select your playlists to shuffle together.';
            const data = await fetchPlaylists(token);
            const playlists = data.items?.map((playlist) => ({
                name: playlist.name,
                uri: playlist.uri,
                public: playlist.public,
                images: playlist.images
            }));
            sessionStorage.playlists = JSON.stringify(playlists);
            const form = document.createElement('form');
            const buttonWrapper = document.createElement('div');
            buttonWrapper.classList.add('button-wrapper');

            sessionStorage.playlistAmountState = 2;

            const removeBtn = document.createElement('button');
            removeBtn.classList.add('less-playlists');
            removeBtn.textContent = 'Remove one';
            removeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                let playlistAmountState = Number(sessionStorage.playlistAmountState);
                if (playlistAmountState <= 2) {
                    return;
                } else {
                    playlistAmountState -= 1;
                    sessionStorage.playlistAmountState = playlistAmountState;
                    document.querySelector('input').remove();
                }
            });

            const addBtn = document.createElement('button');
            addBtn.classList.add('more-playlists');
            addBtn.textContent = 'Select another';
            addBtn.addEventListener('click', (e) => {
                e.preventDefault();
                let playlistAmountState = Number(sessionStorage.playlistAmountState);
                if (playlistAmountState >= 4) return;
                playlistAmountState += 1;
                sessionStorage.playlistAmountState = playlistAmountState;
                const list = createPlaylistSelect(playlists);
                list.forEach((element) => form.appendChild(element));
            });

            const submitBtn = document.createElement('button');
            submitBtn.classList.add('shuffle-button');
            submitBtn.textContent = 'Shuffle!';

            app.appendChild(form);
            form.appendChild(buttonWrapper);
            buttonWrapper.appendChild(removeBtn);
            buttonWrapper.appendChild(addBtn);
            buttonWrapper.appendChild(submitBtn);


            let list = createPlaylistSelect(playlists);
            list.forEach((element) => form.appendChild(element));
            list = createPlaylistSelect(playlists);
            list.forEach((element) => form.appendChild(element));
            
            

        case('review'):
            console.log(`Curr state: ${sessionStorage.currState}`);
        case('complete'):
            console.log(`Curr state: ${sessionStorage.currState}`);
    }
}

function loadTopOfPage(profile) {

    const username = document.querySelector('.display-name');
    username.textContent = `Hi, ${profile.display_name}!`;

    const profilePhoto = document.querySelector('.profile-photo');
    
    if (profile.images.length > 0) {
        profilePhoto.src = profile.images.url;
    } else {
        profilePhoto.src = '../shufflify-logo.png';
    }
}

function logOut() {
    localStorage.clear();
    sessionStorage.clear();
    window.location = '/';
}

function createPlaylistSelect(playlists) {
    const input = document.createElement('input');
    input.setAttribute('list', 'playlist-names');

    const dropDown = document.createElement('datalist');
    dropDown.setAttribute('id', 'playlist-names');

    for (const playlist of playlists) {
        const option = document.createElement('option');
        option.value = option.textContent = playlist.name;
        dropDown.appendChild(option);
    }

    return [input, dropDown];
}