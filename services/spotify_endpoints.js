import axios from "~/plugins/axios";

export default {
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
	get_song: function(artist_id, token) {
		axios.defaults.headers.common['Authorization'] = "Bearer " + token;

		let artist_track_promise = new Promise( (resolve) => {
			axios.get("https://api.spotify.com/v1/artists/" + artist_id + "/top-tracks?country=US").then( (result) => {
				let track_id = result.data.tracks[0].uri;
				resolve(track_id);
			});
		});

		return artist_track_promise;
	},
	set_track: function(track_id, token, device_id) {
		axios.defaults.headers.common['Authorization'] = "Bearer " + token;
		let body = {
			uris: [track_id]
		}
		let play_track_promise = new Promise( (resolve) => {
			axios.put("https://api.spotify.com/v1/me/player/play?device_id=" + device_id, body).then( (result) => {
				// let track_id = result.data.tracks[0].id;
				// resolve(track_id);
			});
		});

		return play_track_promise;
	}
}