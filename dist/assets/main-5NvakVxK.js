import"./modulepreload-polyfill-9p4a8sJU.js";async function s(){i("c5abae397bd547d0b99d3f55a3af65cb");async function i(a){const t=r(128),o=await l(t);localStorage.setItem("verifier",t),localStorage.setItem("client_id",a);const e=new URLSearchParams;e.append("client_id",a),e.append("response_type","code"),e.append("redirect_uri","http://localhost:5173"),e.append("scope","user-read-private user-read-playback-state user-modify-playback-state playlist-read-private playlist-read-collaborative playlist-modify-private playlist-modify-public"),e.append("code_challenge_method","S256"),e.append("code_challenge",o),window.location=`https://accounts.spotify.com/authorize?${e.toString()}`}function r(a){let t="",o="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";for(let e=0;e<a;e++)t+=o.charAt(Math.floor(Math.random()*o.length));return t}async function l(a){const t=new TextEncoder().encode(a),o=await window.crypto.subtle.digest("SHA-256",t);return btoa(String.fromCharCode.apply(null,[...new Uint8Array(o)])).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}}const c=new URLSearchParams(window.location.search),n=c.get("code"),d=c.get("error"),p=document.querySelector(".spotify-connect");p.addEventListener("click",async()=>{await s()});d&&(window.location="/");n&&(sessionStorage.setItem("code",n),window.location="/playlists/");
