import axios from "~/plugins/axios";

function get_song(artist_id, token) {
	axios.defaults.headers.common['Authorization'] = "Bearer " + token;

	let artist_track_promise = new Promise( (resolve) => {
		axios.get("https://api.spotify.com/v1/artists/" + artist_id + "/top-tracks?country=US").then( (result) => {
			let track_id = result.data.tracks[0].uri;
			let track = {
				name: result.data.tracks[0].name,
				length: result.data.tracks[0].duration_ms,
				image: result.data.tracks[0].album.images[0],
				album: result.data.tracks[0].album.name,
				id: track_id,
				artist: result.data.tracks[0].artists[0].name
			}

			resolve(track);
		});
	});

	return artist_track_promise;
}

function play(token) {
	console.log("play()");
	axios.defaults.headers.common['Authorization'] = "Bearer " + token;
	let play_promise = new Promise( (resolve) => {
		axios.put("https://api.spotify.com/v1/me/player/play").then( (result) => {
			resolve();
			return;
		}).catch( (error) => {
			console.log(error);
			resolve();
			return;
		});
	});
	return play_promise;
}

export default {


	get_playlist: function(artist_id, token, user_id) {
		let playlist_promise = new Promise( (resolve) => {
			axios.get("/api/artists/get_similar_artists/" + artist_id + "?access_token=" + token).then( (result) => {
				let ids = result.data.split(",");
				let songs = [];
				ids.forEach( (artist_id) => {
					let song_promise = new Promise( (resolve) => {
						get_song(artist_id, token).then( (track) => {
							resolve(track);
						});
					});
					songs.push(song_promise);
				});
				Promise.all(songs).then( (tracks) => {
					let string_track_ids = '';
					tracks.forEach( (track) => {
						string_track_ids += "," + track.id;
					});
					if (string_track_ids.charAt(0) ==',') {
						string_track_ids = string_track_ids.substring(1, string_track_ids.length);
					}
					if (string_track_ids.charAt(string_track_ids.length) == ',') {
						string_track_ids = string_track_ids.substring(0, string_track_ids.length - 1);
					}
					axios.defaults.headers.common['Authorization'] = "Bearer " + token;
					axios.post("https://api.spotify.com/v1/users/" + user_id + "/playlists", {"name": "audiotree-test"}).then( (result) => {
						let new_playlist_id = result.data.id;
						axios.post("https://api.spotify.com/v1/users/" + user_id + "/playlists/" + new_playlist_id + "/tracks?uris=" + string_track_ids).then( (result) => {
							resolve(result.data);
						});
					});
				});
			});
			
		});
		return playlist_promise;
	},
	get_artist_image: function(artist_id, token) {
		axios.defaults.headers.common['Authorization'] = "Bearer " + token;

		let artist_image_promise = new Promise( (resolve) => {
			axios.get("https://api.spotify.com/v1/artists/" + artist_id).then( (result) => {
				resolve({
					url: result.data.images[0].url,
					id: result.data.id,
					name: result.data.name
				});
			});
		});

		return artist_image_promise;
	},
	get_song: get_song,
	set_playlist: function(playlist_id, token, device_id) {
		axios.defaults.headers.common['Authorization'] = "Bearer " + token;
		let body = {
			context_uri: playlist_id
		}
		console.log(device_id);
		let play_track_promise = new Promise( (resolve) => {
			axios.put("https://api.spotify.com/v1/me/player/play?device_id=" + device_id, body).then( (result) => {
				console.log(result);
				resolve();
				return;
			}).catch( (error) => {
				console.log(error);
				resolve();
				return;
			});
		});

		return play_track_promise;
	},
	get_playing: function(token) {
		console.log("get_playing()");
		axios.defaults.headers.common['Authorization'] = "Bearer " + token;
		
		let get_playing_promise = new Promise( (resolve) => {
			axios.get("https://api.spotify.com/v1/me/player").then( (result) => {
				console.log(result);
				resolve(result.data);
				return;
			}).catch( (error) => {
				console.log(error);
				resolve();
				return;
			});
		});

		return get_playing_promise;
	},
	set_track: function(track_id, token, device_id) {
		axios.defaults.headers.common['Authorization'] = "Bearer " + token;
		let body = {
			uris: [track_id]
		}
		let play_track_promise = new Promise( (resolve) => {
			axios.put("https://api.spotify.com/v1/me/player/play?device_id=" + device_id, body).then( (result) => {
				console.log("song loaded");
			}).catch( (error) => {
				console.log(error);
			});
		});

		return play_track_promise;
	},
	pause: function(token) {
		axios.defaults.headers.common['Authorization'] = "Bearer " + token;

		let pause_promise = new Promise( (resolve) => {
			axios.put("https://api.spotify.com/v1/me/player/pause").then( (result) => {
				resolve();
			});
		});

		return pause_promise;
	},
	play: play
}

