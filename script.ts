const clientId = "e7e8545bab4d4a639680daeaa63be6aa";
const params = new URLSearchParams(window.location.search);
const code = params.get("code");

if (!code) {
    redirectToAuthCodeFlow(clientId);
} else {
    const accessToken = await getAccessToken(clientId, code);
    const profile = await fetchProfile(accessToken);
    populateUI(profile);

    const topArtists = await getTopArtists(accessToken);
    document.getElementById("top1").innerText = topArtists.items[0].name;
    document.getElementById("top2").innerText = topArtists.items[1].name;
    document.getElementById("top3").innerText = topArtists.items[2].name;
    document.getElementById("top4").innerText = topArtists.items[3].name;
    document.getElementById("top5").innerText = topArtists.items[4].name;

	document.getElementById("genre1").innerText = topArtists.items[0].genres[0];
	document.getElementById("genre2").innerText = topArtists.items[1].genres[0];
	document.getElementById("genre3").innerText = topArtists.items[2].genres[0];
	document.getElementById("genre4").innerText = topArtists.items[3].genres[0];
	document.getElementById("genre5").innerText = topArtists.items[4].genres[0];

	const songimg1 = new Image(40, 40);
    songimg1.src = topArtists.items[0].images[0].url;
    document.getElementById("songimg1")!.appendChild(songimg1);
	const songimg2 = new Image(40, 40);
    songimg2.src = topArtists.items[1].images[0].url;
    document.getElementById("songimg2")!.appendChild(songimg2);
	const songimg3 = new Image(40, 40);
    songimg3.src = topArtists.items[2].images[0].url;
    document.getElementById("songimg3")!.appendChild(songimg3);
	const songimg4 = new Image(40, 40);
    songimg4.src = topArtists.items[3].images[0].url;
    document.getElementById("songimg4")!.appendChild(songimg4);
	const songimg5 = new Image(40, 40);
    songimg5.src = topArtists.items[4].images[0].url;
    document.getElementById("songimg5")!.appendChild(songimg5);

    const topTracks = await getTopTracks(accessToken);
    document.getElementById("topt1").innerText = topTracks.items[0].name;
    document.getElementById("topt2").innerText = topTracks.items[1].name;
    document.getElementById("topt3").innerText = topTracks.items[2].name;
    document.getElementById("topt4").innerText = topTracks.items[3].name;
    document.getElementById("topt5").innerText = topTracks.items[4].name;

	const songimgt1 = new Image(40, 40);
    songimgt1.src = topTracks.items[0].album.images[0].url;
    document.getElementById("songimgt1")!.appendChild(songimgt1);
	const songimgt2 = new Image(40, 40);
    songimgt2.src = topTracks.items[1].album.images[0].url;
    document.getElementById("songimgt2")!.appendChild(songimgt2);
	const songimgt3 = new Image(40, 40);
    songimgt3.src = topTracks.items[2].album.images[0].url;
    document.getElementById("songimgt3")!.appendChild(songimgt3);
	const songimgt4 = new Image(40, 40);
    songimgt4.src = topTracks.items[3].album.images[0].url;
    document.getElementById("songimgt4")!.appendChild(songimgt4);
	const songimgt5 = new Image(40, 40);
    songimgt5.src = topTracks.items[4].album.images[0].url;
    document.getElementById("songimgt5")!.appendChild(songimgt5);

	const recs = await getRecs(accessToken);
	document.getElementById("rectitle").innerText = recs.tracks[0].name;

	const recimg = new Image(40, 40);
    recimg.src = recs.tracks[0].album.images[0].url;
    document.getElementById("recimg")!.appendChild(recimg);

	document.getElementById("recuri").innerText = recs.tracks[0].preview_url;
	document.getElementById('recname').innerText = recs.tracks[0].artists.name;
	
	yourFunction(accessToken);
}

async function yourFunction(token: string) {
	try {
		const topArtists = await getTopArtists(token);

		const spotifyTrackURI = topArtists.items[0].uri;

		console.log('Spotify Track URI:', spotifyTrackURI);

		const embedCode = `<iframe src="https://open.spotify.com/embed/track/${spotifyTrackURI}" width="300" height="380" frameborder="0" allowtransparency="true" allow="encrypted-media"></iframe>`;

		const spotifyPlayerElement = document.getElementById('spotifyPlayer');
		if (spotifyPlayerElement) {
		console.log('Found spotifyPlayerElement:', spotifyPlayerElement);
		spotifyPlayerElement.innerHTML = embedCode;
		} else {
		console.log('spotifyPlayerElement not found!');
		}
	} catch (error) {
		console.error('Error fetching top artists:', error);
	}
}


export async function redirectToAuthCodeFlow(clientId: string) {
    const verifier = generateCodeVerifier(128);
    const challenge = await generateCodeChallenge(verifier);

    localStorage.setItem("verifier", verifier);

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("response_type", "code");
    params.append("redirect_uri", "http://localhost:5173/callback");
    params.append("scope", "user-read-private user-read-email user-top-read");
    params.append("code_challenge_method", "S256");
    params.append("code_challenge", challenge);

    document.location = `https://accounts.spotify.com/authorize?${params.toString()}`;
}

function generateCodeVerifier(length: number) {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

async function generateCodeChallenge(codeVerifier: string) {
    const data = new TextEncoder().encode(codeVerifier);
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, [...new Uint8Array(digest)]))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}


export async function getAccessToken(clientId: string, code: string): Promise<string> {
    const verifier = localStorage.getItem("verifier");

    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", "http://localhost:5173/callback");
    params.append("code_verifier", verifier!);

    const result = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const { access_token } = await result.json();
    return access_token;
}

async function fetchProfile(token: string): Promise<UserProfile> {
    const result = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}

function populateUI(profile: UserProfile) {
    document.getElementById("displayName")!.innerText = profile.display_name;
    if (profile.images[0]) {
        const profileImage = new Image();
        profileImage.src = profile.images[0].url;
        document.getElementById("avatar")!.appendChild(profileImage);
    }
    document.getElementById("id")!.innerText = profile.id;
    document.getElementById("email")!.innerText = profile.email;
    document.getElementById("uri")!.innerText = profile.uri;
    document.getElementById("uri")!.setAttribute("href", profile.external_urls.spotify);
    document.getElementById("url")!.innerText = profile.href;
    document.getElementById("url")!.setAttribute("href", profile.href);
    document.getElementById("imgUrl")!.innerText = profile.images[0]?.url ?? '(no profile image)';
}

async function getTopArtists(token: string): Promise<any> {
    const result = await fetch("https://api.spotify.com/v1/me/top/artists", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}

async function getTopTracks(token: string): Promise<any> {
    const result = await fetch("https://api.spotify.com/v1/me/top/tracks", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}

async function getRecs(token: string): Promise<any> {
    const result = await fetch("https://api.spotify.com/v1/recommendations?seed_artists=2RQXRUsr4IW1f3mKyKsy4B&seed_genres=folk%2Ccountry&seed_tracks=0mflMxspEfB0VbI1kyLiAv", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    return await result.json();
}