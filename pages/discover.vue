<template>
  <section class="container">
   <h1>
	   <!-- v-click="set_artist_bubbles($store.state.user.top_artists)" -->
	   <span class="nav-text">reload favorites</span>
	   <span>{{title}}</span>
	</h1>

   <div v-on:click="open_stream(bubble)" class="artist-bubble" v-for="bubble in artist_bubbles" :key="bubble.id" v-bind:style="{ backgroundImage: 'url(' + bubble.url + ')' }">
	   <span v-bind:id="bubble.id">{{bubble.name}}</span>
	</div>

	<div class="player" v-if="show_player">
		<h4 v-if="device_id != ''">Player Ready</h4>
		<script src="https://sdk.scdn.co/spotify-player.js"></script>
	</div>

  </section>
</template>

<script>
import axios from "~/plugins/axios";
import spotify_endpoints from "../services/spotify_endpoints.js";


export default {
	data() {
		return {
			artist_bubbles: [],
			token: '',
			title: 'Root',
			show_player: false,
			device_id: ''
		}
	},
	methods: {
		open_stream: function(bubble) {
			this.artist_bubbles = [bubble];
			this.title = "Tree";
			this.show_player = true;
			window.onSpotifyWebPlaybackSDKReady = () => {
				const token = this.token; //'[My Spotify Web API access token]';
				const player = new Spotify.Player({
					name: 'Web Playback SDK Quick Start Player',
					getOAuthToken: cb => {

						cb(token);
					}
				});

				// Error handling
				player.addListener('initialization_error', ({ message }) => { console.error(message); });
				player.addListener('authentication_error', ({ message }) => { console.error(message); });
				player.addListener('account_error', ({ message }) => { console.error(message); });
				player.addListener('playback_error', ({ message }) => { console.error(message); });

				// Playback status updates
				player.addListener('player_state_changed', state => { console.log(state); });

				// Ready
				player.addListener('ready', function({ device_id }) {
					this.device_id = device_id;
					spotify_endpoints.get_song(this.artist_bubbles[0].id, this.token).then( function(track_id) {
						spotify_endpoints.set_track(track_id, this.token, this.device_id);
					}.bind(this));
				}.bind(this));

				// Connect to the player!
				player.connect();
			};
		},
		set_artist_bubbles: function(top_artists) {
			let artists_chosen = [];
			this.randomProperty = function(obj) {
				var keys = Object.keys(obj)
				let field_number = keys.length * Math.random() << 0;
				return {
					name: obj[keys[field_number]],
					id: keys[field_number]
				};
			};
			for (let i = 0; i < 3; i++) {
				let random_artist = this.randomProperty(top_artists);
				//TODO: doesn't seem to be working to prevent duplicates
				while (artists_chosen.indexOf(random_artist) != -1) {
					random_artist = this.randomProperty(top_artists);
				}
				artists_chosen.push(random_artist);
			}


			this.load_all_artists = function(artists) {
				let artist_promises = [];
				artists.forEach( (artist) => {
					artist_promises.push(spotify_endpoints.get_artist_image(artist.id, this.token));
				});

				this.handle_all = function(results) {
					this.artist_bubbles = results;
				};
				
				Promise.all(artist_promises).then(this.handle_all.bind(this));
				
				
			}
			
			this.load_all_artists(artists_chosen);
		}
	},
	beforeMount() {
		var images = this.artist_images;
		if (sessionStorage.getItem("showgo_user") !== "undefined" && sessionStorage.getItem("showgo_user") !== null) {
			this.$store.commit('store_user', JSON.parse(sessionStorage.getItem("showgo_user")));
			this.token = JSON.parse(sessionStorage.getItem("showgo_user")).spotify_access_token;
			this.set_artist_bubbles(this.$store.state.user.top_artists);
		} else {
			console.log("dont have user");
		}
	}
};

</script>

<style scoped>
.nav-text {
	font-size: 10px;
    vertical-align: middle;
    position: absolute;
    left: 15px;
    cursor: pointer;
    text-decoration: underline;
}
.artist-bubble {
	width: 150px;
	height: 150px;
	border-radius: 50%;
	background-color: lightgrey;
	margin: 10px auto;
	background-size: contain;
	animation: animate 3s linear infinite;
	font-size: 20px;
	text-align: center;
	font-family: verdana, sans-serif;
	cursor: pointer;
}
.artist-bubble span {
	color: white;
    vertical-align: middle;
    height: inherit;
    display: table-cell;
	text-align: center;
	width: inherit;
	background-color: rgba(0,0,0,.5);
	border-radius: 50%;
}
@keyframes animate
{
	0%
	{
		box-shadow: 0 0 0 0 rgb(46, 189, 89,.7),  0 0 0 0 rgb(46, 189, 89,.7);
	}

	40%
	{
		box-shadow: 0 0 0 20px rgb(46, 189, 89,.0),  0 0 0 0 rgb(46, 189, 89,.7);
	}

	80%
	{
		box-shadow: 0 0 0 20px rgb(46, 189, 89,.0),  0 0 0 20px rgb(46, 189, 89,.0);
	}

	100%
	{
		box-shadow: 0 0 0 0 rgb(46, 189, 89,.0), 0 0 0 20px rgb(46, 189, 89,.0);
	}
}
</style>
