export default async function spotifyDataFetch() {

    const clientId = "c5abae397bd547d0b99d3f55a3af65cb"; // Replace with your client ID
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (!code) {
        redirectToAuthCodeFlow(clientId);
    } else {
        await getAccessToken(clientId, code);
        const accessToken = sessionStorage.getItem("access_token");
        const profile = await fetchProfile(accessToken);
        const userID = profile.id;
        let data = await fetchPlaylists(accessToken);
        const playlists = data.items.map((playlist) => ({
            name: playlist.name,
            uri: playlist.uri
        }));
        console.log(playlists);
        //if playlist selected, then fetchPlaylistItems and append to list of currItems
        // shuffle currItems. add to queue one by one. if create playlist is selected, create new playlist. then add items to new playlist
        // populateUI(profile);
    }

    /* || Authentication */

    async function redirectToAuthCodeFlow(clientId) {
        const verifier = generateCodeVerifier(128);
        const challenge = await generateCodeChallenge(verifier);

        sessionStorage.setItem("verifier", verifier);

        const params = new URLSearchParams();
        params.append("client_id", clientId);
        params.append("response_type", "code");
        params.append("redirect_uri", "http://localhost:5173/callback");
        params.append("scope", "user-read-private user-read-playback-state user-modify-playback-state playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public");
        params.append("code_challenge_method", "S256");
        params.append("code_challenge", challenge);

        document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
    }

    function generateCodeVerifier(length) {
        let text = '';
        let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    async function generateCodeChallenge(codeVerifier) {
        const data = new TextEncoder().encode(codeVerifier);
        const digest = await window.crypto.subtle.digest('SHA-256', data);
        return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }

    async function getAccessToken(clientId, code) {
        const verifier = sessionStorage.getItem("verifier");
        const refresh = sessionStorage.getItem("refresh_token");

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

        sessionStorage.setItem("access_token", response.access_token);
        sessionStorage.setItem("refresh_token", response.refresh_token);
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

    async function fetchPlaylistItems(token, playlist_id) {
        const result = await fetch(`https://api.spotify.com/v1/playlist/${playlist_id}/tracks`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}`}
        });

        const response = await result.json();

        const items = response.items.map((track) => ({
            name: track.name,
            artists: track.artists,
            uri: track.uri
        }));

        return items;
    } 


    async function addToQueue(token, uri) {
        const result = await fetch(`https://api.spotify.com/v1/me/player/queue`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`},
            body: new URLSearchParams({
                uri: uri 
            })
        });
        
        //check if successful
    }


    async function createPlaylist(token, uriList, user_id) {

        const result = await fetch(`https://api.spotify.com/v1/users/${user_id}/playlists`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`},
            body: new URLSearchParams({
                uris: uriList.map((item) => item.uri),
                name: "Shufflify Playlist",
                public: false,
                description: "A playlist created by Shufflify." 
            })
        });

        const playlist = await result.json()

        return playlist;
    }

    async function addTracksToPlaylist(token, uriList, playlist_id) {

        const result = await fetch(`https://api.spotify.com/v1/playlist/${playlist_id}/tracks`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`},
            body: new URLSearchParams({
                uris: uriList.map((item) => item.uri) 
            })
        });
    }

    function shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
        
            [array[i], array[j]] = [array[j], array[i]];
          }
    }




}