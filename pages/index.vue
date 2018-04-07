<template>
  <section class="container">
    <img src="~assets/img/tree.png" alt="Nuxt.js Logo" class="logo" />
    <h1 class="title">
    	audiotree
    </h1>
	<h3>
		Discover your next favorite band.
	</h3>
	<a href="http://localhost:3000/api/spotify_login/send_to_spotify_for_login" class="continue-with-spotify">Continue with Spotify</a>

  </section>
</template>

<script>
import axios from "~/plugins/axios";

export default {
  methods: {
	  get_user: async function() {

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
				.access_token,
				refresh_token: JSON.parse(sessionStorage.getItem("showgo_user"))
				.refresh_token
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
		if (pairs.length > 0) {
			let token_pairs_stringified = JSON.stringify(pairs);
			let { data } = await axios.get("/api/users/me" + token_pairs_stringified);
			console.log(data);
		} else {
			//no user
		}

		// gives us the .data field from the response?
		let { data } = await axios.get('/api/users')
		return { users: data }
	  }
  },
  head() {
    return {
      title: "audiotree"
    };
  },
  mounted() {
	  this.get_user();
  }
};
</script>

<style scoped>
.title {
  margin: 30px 0;
}
.users {
  list-style: none;
  margin: 0;
  padding: 0;
}
.user {
  margin: 10px 0;
}
</style>
