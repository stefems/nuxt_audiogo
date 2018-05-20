import axios from "~/plugins/axios";
export default {
	artist_discovered: function(artist_id, artist_name, token){
		let discovered_promise = new Promise( (resolve) => {
			axios.put("/api/users/discover?artist_name=" + artist_name + "&artist_id=" + artist_id + "&access_token=" + token).then( (result) => {
				resolve();
			});
		});
		return discovered_promise;
	}
}