import axios from "~/plugins/axios";

function search_band(name, token) {
	axios.defaults.headers.common['Authorization'] = "Bearer " + token;

	let band_search_promise = new Promise( (resolve) => {
		axios.get("https://api.spotify.com/v1/search?type=artist&q=" + name).then( (result) => {
			let artists = [];
			artists = result.data.artists.items;
				result.data.artists.items.forEach( (artist) => {
					if (artist.images[0]) {
						artist.url = artist.images[0].url;
						artist.image_size = { width: artist.images[0].width, height: artist.images[0].height}
					}
					else {
						artist.url = null;
					}
				});
			resolve(artists);
		});
	});

	return band_search_promise;
}

function get_song(artist_id, token) {
	axios.defaults.headers.common['Authorization'] = "Bearer " + token;
	if (!artist_id || artist_id == '' || artist_id == 'null') {
		return Promise.resolve();
	}
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

function get_songs(artist_id, token) {
	axios.defaults.headers.common['Authorization'] = "Bearer " + token;

	let artist_track_promise = new Promise( (resolve) => {
		axios.get("https://api.spotify.com/v1/artists/" + artist_id + "/top-tracks?country=US").then( (result) => {
			resolve( result.data.tracks);
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

function set_playlist(playlist_id, token, device_id) {
	axios.defaults.headers.common['Authorization'] = "Bearer " + token;
	let body = {
		"context_uri": playlist_id,
		"offset": {
			"position": 0
		}
	}
	if (device_id) {
		device_id = "?device_id=" + device_id;
	}
	else {
		device_id = '';
	}
	let play_track_promise = new Promise( (resolve) => {
		axios.put("https://api.spotify.com/v1/me/player/play" + device_id, body).then( (result) => {
			resolve();
			return;
		}).catch( (error) => {
			console.log(error);
			resolve();
			return;
		});
	});

	return play_track_promise;
}

export default {

	get_songs: get_songs,
	get_song: get_song,
	search_band: search_band,
	play: play,
	set_playlist: set_playlist,
	get_playlist: function(artist_id, token, user_id) {
		let playlist_promise = new Promise( (resolve) => {
			axios.get("/api/artists/get_similar_artists/" + artist_id + "?access_token=" + token).then( (result) => {
				if (!result || result == null || result == 'null') {
					console.log("got null");
					resolve();
					return;
				}
				let ids = result.data.split(",");
				let songs = [];
				ids.forEach( (artist_id) => {
					if (!artist_id || artist_id == null || artist_id == 'null' || artist_id == '') {
						return Promise.resolve();
					}
					let song_promise = new Promise( (resolve) => {
						get_song(artist_id, token).then( (track) => {
							resolve(track);
						});
					});
					songs.push(song_promise);
				});
				Promise.all(songs).then( (tracks) => {
					console.log(tracks);
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
						let audiotree_playlist = {};
						for (let i = 0; i < result.data.items.length; i++) {
							let playlist = result.data.items[i];
							if (playlist.name == "audiotree-test") {
								audiotree_playlist = playlist;
								break;
							}
						}
						if (audiotree_playlist.id != '') {
							axios.get("https://api.spotify.com/v1/users/" + user_id + "/playlists/" + audiotree_playlist.id).then( (result) => {
								audiotree_playlist = result.data;
								add_songs(audiotree_playlist);
							});
						}
						else {
							create_playlist();
						}
						function create_playlist() {
							axios.post("https://api.spotify.com/v1/users/" + user_id + "/playlists", {"name": "audiotree-test"}).then( (result) => {
								let new_playlist_id = result.data.id;
								playlist = result.data;
								add_songs(playlist);
							}).catch( (error) => {
								console.log(error);
							});
						}
						function add_songs(playlist_to_change) {
							axios.put("https://api.spotify.com/v1/users/" + user_id + "/playlists/" + playlist_to_change.id + "/tracks?uris=" + string_track_ids).then( (result) => {
								axios.get("https://api.spotify.com/v1/users/" + user_id + "/playlists/" + playlist_to_change.id).then( (result) => {
									resolve(result.data);
								});
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
					name: result.data.name,
					image_size: { width: result.data.images[0].width, height: result.data.images[0].height}
				});
			});
		});

		return artist_image_promise;
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
	set_track: function(track_uri, token, device_id) {
		axios.defaults.headers.common['Authorization'] = "Bearer " + token;
		let body = {
			uris: [track_uri]
		}
		let play_track_promise = new Promise( (resolve) => {
			axios.put("https://api.spotify.com/v1/me/player/play?device_id=" + device_id, body).then( (result) => {
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
	skip: function(token) {
		axios.defaults.headers.common['Authorization'] = "Bearer " + token;

		let skip_promise = new Promise( (resolve) => {
			axios.post("https://api.spotify.com/v1/me/player/next").then( (result) => {
				resolve();
			});
		});
		return skip_promise;
	},
	loop: function(current_track, user, track_ids_not_to_use, playlist) {
		axios.defaults.headers.common['Authorization'] = "Bearer " + token;
		let artist_id = current_track.artist_id;
		let token = user.spotify_access_token;
		let new_loop_track_promise = new Promise( (resolve) => {
			this.get_songs(artist_id, token).then( (songs) => {
				let new_song_to_play;
				for (let song_index = 0; song_index < songs.length; song_index++) {
					let song = songs[song_index];
					if (track_ids_not_to_use.indexOf(song.id) == -1) {
						new_song_to_play = song;
						break;
					}
				}
				if (new_song_to_play) {
					//get the location in the playlist to insert the song
					axios.get("https://api.spotify.com/v1/users/" + user.id + "/playlists/" + playlist.id).then( (result) => {
						let track_index;
						let track;
						for (let i = 0; i < result.data.tracks.items.length; i++){
							track = result.data.tracks.items[i].track;
							if (track.id == current_track.id) {
								track_index = i + 1;
								break;
							}
						}
						console.log(track_index);
						//use new_song_to_play and place in the playlist
						axios.post("https://api.spotify.com/v1/users/" + user.id + "/playlists/" + playlist.id + "/tracks?position=" + track_index + "&uris=" + new_song_to_play.uri).then( () => {
							resolve(new_song_to_play);
							return;
						});
					});
				}
				else {
					//no songs left (we could send anoter request)
					resolve();
					return;
				}
			}).catch( (error) => {
				//error when getting songs for this artist
				resolve();
				return;
			});
		});
		return new_loop_track_promise;
	},
}

