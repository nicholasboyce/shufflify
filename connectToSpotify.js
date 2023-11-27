export default async function connectToSpotify() {

    const clientId = "c5abae397bd547d0b99d3f55a3af65cb"; // Replace with your client ID

    redirectToAuthCodeFlow(clientId);


        //if playlist selected, then fetchPlaylistItems and append to list of currItems
        // shuffle currItems. add to queue one by one. if create playlist is selected, create new playlist. then add items to new playlist
        // populateUI(profile);
    

    /* || Authentication */

    async function redirectToAuthCodeFlow(clientId) {
        const verifier = generateCodeVerifier(128);
        const challenge = await generateCodeChallenge(verifier);

        localStorage.setItem("verifier", verifier);
        localStorage.setItem("client_id", clientId);

        const params = new URLSearchParams();
        params.append("client_id", clientId);
        params.append("response_type", "code");
        params.append("redirect_uri", "http://localhost:5173");
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

    /* || Authentication */

    async function fetchPlaylistItems(token, playlist_id) {
        const result = await fetch(`https://api.spotify.com/v1/playlist/${playlist_id}/tracks`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}`}
        });

        const response = await result.json();

        const items = response.items.map((track) => ({
            name: track.name,
            artists: track.artists,
            uri: track.uri,
            images: track.artists.images
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