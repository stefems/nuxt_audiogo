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
	}
}