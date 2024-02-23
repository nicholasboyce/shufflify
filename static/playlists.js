import profilePhotoURL from '../images/shufflify-logo.png'

const code = sessionStorage.getItem("code");
const clientId = localStorage.getItem("client_id");

const states = ['select', 'review', 'complete']; //Possible states of app once logged in
let tracks = [];
let playlistURL = '';

sessionStorage.currState ??= states[0]; //Checks if currState is null/undefined - if so, set to states[0] 
let playlistSelectID = 1;

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
  if (refresh === null || refresh === "undefined")  { // have to have 'undefined' check in string, else it fails
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "https://www.shufflify.app");
    params.append("code_verifier", verifier);
  } else {
    params.append("grant_type", "refresh_token");
    params.append("refresh_token", refresh);
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

  const profile = await result.json();
  sessionStorage.user_id = profile.id;
  sessionStorage.product = profile.product;

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
    sessionStorage.currState = 'select';
    const profile = await fetchProfile(token);

    loadTopOfPage(profile);

    await renderPage(token);
}

function loadTopOfPage(profile) {

    const username = document.querySelector('.display-name');
    username.textContent = `Hi, ${profile.display_name}!`;

    const profilePhoto = document.querySelector('.profile-photo');
    const photoWrapper = document.querySelector('.photo-wrapper');

    const logOutBtn = document.querySelector('.log-out');
    

   photoWrapper.addEventListener('click', () => {
        //log out option
        logOutBtn.classList.toggle('show');
    });

    logOutBtn.addEventListener('click', () => {
        logOut();
        console.log('Logged out safely!');
    });
    
    if (profile.images.length > 0) {
        profilePhoto.src = profile.images[0].url;
    } else {
        profilePhoto.src = profilePhotoURL;
    }
}

function logOut() {
    localStorage.clear();
    sessionStorage.clear();
    window.location = '/';
}

function createPlaylistSelect(playlists) {

    const input = document.createElement('input');
    input.setAttribute('list', `playlist-names-${playlistSelectID}`);
    input.setAttribute('id', `${playlistSelectID}`);
    input.setAttribute('name', `playlist-${playlistSelectID}`);

    const dropDown = document.createElement('datalist');
    dropDown.setAttribute('id', `playlist-names-${playlistSelectID}`);

    for (const playlist of playlists) {
        const option = document.createElement('option');
        option.dataset.value = playlist.id;
        let cleanedName = playlist.name.replaceAll(/'/g, "\\'");
        cleanedName = cleanedName.replaceAll(/"/g, '\\"');
        option.value = option.textContent = cleanedName;
        dropDown.appendChild(option);
    }

    playlistSelectID++;

    return [input, dropDown];
}

async function fetchPlaylistItems(token, playlist_id) {
    const result = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}`}
    });

    const response = await result.json();

    const items = response.items.map((item) => ({
        name: item.track.name,
        artists: item.track.artists,
        uri: item.track.uri,
        images: item.track.album.images
    }));

    return items;
}

async function renderPage(token) {
    const app = document.querySelector('.app');
    const instructions = document.querySelector('.instructions');

    switch(sessionStorage.currState) {
        case('select'):
            instructions.textContent = 'Select up to 4 playlists to shuffle together!';
            app.textContent = '';
            const data = await fetchPlaylists(token);
            const playlists = data.items?.map((playlist) => ({
                name: playlist.name,
                uri: playlist.uri,
                public: playlist.public,
                images: playlist.images,
                id: playlist.id
            }));
            sessionStorage.playlists = JSON.stringify(playlists);
            const form = document.createElement('form');
            form.setAttribute('method', 'GET');
            form.setAttribute('action', '/playlists/');
            const selButtonWrapper = document.createElement('div');
            selButtonWrapper.classList.add('button-wrapper');

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

            form.appendChild(selButtonWrapper);

            selButtonWrapper.appendChild(removeBtn);
            selButtonWrapper.appendChild(addBtn);
            selButtonWrapper.appendChild(submitBtn);

            submitBtn.type = 'submit';
            submitBtn.classList.add('shuffle-button');
            submitBtn.textContent = 'Shuffle!';
            submitBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                const playlistIDs = [];
                const formInputs = document.querySelectorAll('form input');
                for (const input of formInputs) {
                    playlistIDs.push(document.querySelector(`#${input.list.id} option[value=${input.value}]`).dataset.value);
                }
                for (const playlistID of playlistIDs) {
                    const items = await fetchPlaylistItems(token, playlistID);
                    items.forEach((track) => tracks.push(track));
                }

                sessionStorage.currState = 'review';
                await renderPage(token);
                //switch state and re-render accordingly
            });

            app.appendChild(form);


            let list = createPlaylistSelect(playlists);
            list.forEach((element) => form.appendChild(element));
            list = createPlaylistSelect(playlists);
            list.forEach((element) => form.appendChild(element));
            
            break;

        case('review'):
            instructions.textContent = 'Review your shuffle!';
            app.textContent = '';
            shuffle(tracks);

            const trackList = document.createElement('div');
            trackList.classList.add('track-list');
            app.appendChild(trackList);
            
            for (const track of tracks) {
                trackList.appendChild(createTrackCard(track));
            }

            const reshuffleBtn = document.createElement('button');
            reshuffleBtn.classList.add('reshuffle-button');
            reshuffleBtn.textContent = 'Reshuffle';
            reshuffleBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                await renderPage(token);
            });

            const createPlaylistBtn = document.createElement('button');
            createPlaylistBtn.classList.add('create-playlist-button');
            createPlaylistBtn.textContent = 'Create playlist';
            createPlaylistBtn.addEventListener('click', async (e) => {
                e.preventDefault();
                const playlist = await createPlaylist(token, tracks);
                playlistURL = playlist.external_urls.spotify;
                sessionStorage.currState = 'complete';
                await renderPage(token);
            });

            if (sessionStorage.product === 'premium') {
                const addToQueueBtn = document.createElement('button');
                addToQueueBtn.classList.add('add-to-queue-button');
                addToQueueBtn.addEventListener('click', async (e) => {
                    e.preventDefault();
                    for (const track of tracks) {
                        await addToQueue(token, track.uri);
                    }
                })
            } 

            const reviewButtonWrapper = document.createElement('div');
            reviewButtonWrapper.classList.add('button-wrapper');
            reviewButtonWrapper.appendChild(reshuffleBtn);
            reviewButtonWrapper.appendChild(createPlaylistBtn);
            if (typeof addToQueueBtn !== 'undefined') reviewButtonWrapper.appendChild(addToQueueBtn);

            app.appendChild(reviewButtonWrapper);

            break;

        case('complete'):
            instructions.textContent = 'Playlist made! Now you can check out on Spotify!'
            app.textContent = '';

            const spotifyConnectBtn = document.querySelector('.spotify-connect');
            spotifyConnectBtn.style.display = 'flex';
            spotifyConnectBtn.addEventListener('click', () => {
                window.open(playlistURL, '_blank');
            });


            const newShuffleBtn = document.createElement('button');
            newShuffleBtn.textContent = 'Let\'s go again!';
            newShuffleBtn.addEventListener('click', (e) => {
                e.preventDefault();
                sessionStorage.currState = 'select';
                spotifyConnectBtn.style.display = 'none';
                renderPage(token);
            });

            const goHomeButton = document.createElement('button');
            goHomeButton.textContent = 'Log out';
            goHomeButton.addEventListener('click', logOut);

            newShuffleBtn.style.width = goHomeButton.style.width = '10rem';
            app.appendChild(newShuffleBtn);
            app.appendChild(goHomeButton);

            break;
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
    
        [array[i], array[j]] = [array[j], array[i]];
      }
}

function createTrackCard(track) {
    const card = document.createElement('div');
    card.classList.add('card');

    const photo = document.createElement('img');
    photo.classList.add('album-art');
    photo.src = track.images[0].url;

    const text = document.createElement('div');
    text.classList.add('card-textContent');

    const name = document.createElement('h3');
    name.textContent = track.name;

    const artist = document.createElement('p');
    artist.textContent = track.artists[0].name;

    card.appendChild(photo);
    card.appendChild(text);
    text.appendChild(name);
    text.appendChild(artist);

    return card;
}

async function addToQueue(token, uri) {
    await fetch(`https://api.spotify.com/v1/me/player/queue`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`},
        body: new URLSearchParams({
            uri: uri 
        })
    });
    
    //check if successful
}

async function createPlaylist(token,uriList) {

    const user_id = sessionStorage.user_id;
    const name = prompt('Name of playlist:');
    const description = prompt('Description of playlist:');


    const result = await fetch(`https://api.spotify.com/v1/users/${user_id}/playlists`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`},
        body: JSON.stringify({
            "name": name ?? "Shufflify Playlist",
            "public": false,
            "description": description ?? "A playlist created by Shufflify." 
        })
    });

    const playlist = await result.json();
    console.log(playlist);


    await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`},
        body: JSON.stringify({
            uris: uriList.map((track) => track.uri) 
        })
    });

    return playlist;
}