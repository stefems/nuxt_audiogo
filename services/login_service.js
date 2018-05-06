import axios from "~/plugins/axios";
import Vue from 'vue'

export default {
	get_user: function() {

		let user_promise = new Promise( function(resolve) {
			function get_params() {
				let params = (new URL(document.location)).searchParams;
				var token_data = null;
				if (params.get("access_token") && params.get("refresh_token")) {
					token_data = {
						access_token: params.get("access_token"),
						refresh_token: params.get("refresh_token")
					};
				}
	
				if (token_data) {
					return token_data;
				} else {
					return null;
				}
			}
	
			function check_local_storage() {
				if (
					sessionStorage.getItem("showgo_user") !== "undefined" &&
					sessionStorage.getItem("showgo_user") !== null
				) {
					return {
					access_token: JSON.parse(sessionStorage.getItem("showgo_user"))
					.spotify_access_token,
					refresh_token: JSON.parse(sessionStorage.getItem("showgo_user"))
					.spotify_refresh_token
					};
				} else {
					return null;
				}
			}
	
			let params_data = get_params();
			let session_user = check_local_storage();
			let pairs = [];
			if (params_data) {
				pairs.push(params_data);
			}
			if (session_user) {
				pairs.push(session_user);
			}
			let data;
			if (pairs.length > 0) {
				let token_pairs_stringified = JSON.stringify(pairs);
				axios.get("/api/user_changes/user?access_refresh_pairs=" + token_pairs_stringified).then( function(data) {
					data = data.data;
					this.$store.commit('store_user', data);
					resolve(data);
				});

			} else {
				//no user
				data = null;
				resolve(data);
			}
		});



		return user_promise;
	  }
}