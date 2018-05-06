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
					axios.get("https://api.spotify.com/v1/users/" + user_id + "/playlists").then( (result) => {
						let test_id = '';
						let uri = '';
						result.data.items.forEach( (playlist) => {
							if (playlist.name == "audiotree-test") {
								test_id = playlist.id;
								uri = playlist.uri;
							}
						});
						if (test_id != '') {
							add_songs(test_id);
						}
						else {
							create_playlist();
						}
						function create_playlist() {
							axios.post("https://api.spotify.com/v1/users/" + user_id + "/playlists", {"name": "audiotree-test"}).then( (result) => {
								let new_playlist_id = result.data.id;
								add_songs(new_playlist_id);
							}).catch( (error) => {
								console.log(error);
							});
						}
						function add_songs(playlist_id) {
							axios.put("https://api.spotify.com/v1/users/" + user_id + "/playlists/" + playlist_id + "/tracks?uris=" + string_track_ids).then( (result) => {
								resolve(uri);
							}).catch( (error) => {
								console.log(error);
							});
						}
						
					}).catch( (error) => {
						console.log(error);
					});
					
				}).catch( (error) => {
					console.log(error);
				});;
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
			"context_uri": playlist_id,
			"offset": {
				"position": 0
			}
		}
		let play_track_promise = new Promise( (resolve) => {
			axios.put("https://api.spotify.com/v1/me/player/play?device_id=" + device_id, body).then( (result) => {
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
	offshoot_playlist: function(playlist_id, token, device_id) {
		axios.defaults.headers.common['Authorization'] = "Bearer " + token;
		let body = {
			"context_uri": playlist_id,
			"offset": {
				"position": 0
			}
		}
		let play_track_promise = new Promise( (resolve) => {
			axios.put("https://api.spotify.com/v1/me/player/play?device_id=" + device_id, body).then( (result) => {
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
		axios.defaults.headers.common['Authorization'] = "Bearer " + token;
		
		let get_playing_promise = new Promise( (resolve) => {
			axios.get("https://api.spotify.com/v1/me/player").then( (result) => {
				console.log(result);
				resolve(result);
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
	play: play,
	skip: function(token) {
		axios.defaults.headers.common['Authorization'] = "Bearer " + token;

		let skip_promise = new Promise( (resolve) => {
			axios.post("https://api.spotify.com/v1/me/player/next").then( (result) => {
				resolve();
			});
		});
		return skip_promise;
	},
	loop: function(token) {
		//needs to grab another song from this band and insert them into the playlist. Each new song that is played will queue another one to be 
		// added, and if the user toggles the loop off, the next song will get removed and the rest of the playlist will continue.
		axios.defaults.headers.common['Authorization'] = "Bearer " + token;

		let skip_promise = new Promise( (resolve) => {
			axios.post("https://api.spotify.com/v1/me/player/next").then( (result) => {
				resolve();
			});
		});
		return skip_promise;
	}
}

