<template>
	<div class="mdl-layout mdl-js-layout mdl-layout--fixed-header">

	<div class="android-header mdl-layout__header mdl-layout__header--waterfall">
			<div aria-expanded="false" role="button" tabindex="0" class="mdl-layout__drawer-button"><i class="material-icons">menu</i></div>
			<div class="mdl-layout__header-row">
				<span class="title-image">
					<img src="~assets/img/bandaid.png">
				</span>
			</div>
			<i class="material-icons search-icon header-search" v-bind:class="{ invisible: !searchAtTop }">search</i>
		</div>
		<!-- Drawer -->
		<div class="android-drawer mdl-layout__drawer">
			<span class="mdl-layout-title">
			<img class="android-logo-image" src="~assets/img/bandaid.png">
			</span>
			<nav class="mdl-navigation">
			<a class="mdl-navigation__link" href="">Favorites</a>
			<span class="mdl-navigation__link"  v-on:click="logout()" href="">Logout</span>
			</nav>
		</div>
	<div class="android-content mdl-layout__content">
		<div class="search-section" v-bind:class="{ animatehide: animateHide }">
			<h4>Search for a band or pick one from your favorites below</h4>
			<div class="search-bar">
				<input v-on:input="searchHandler($event.target.value)" placeholder="Search" type="text">
				<i class="material-icons search-icon">search</i>
			</div>
			<div v-if="artistBubbles.length > 0" class="results-container">
				<div class="bubble-container" v-for="bubble in artistBubbles" :key="bubble.id">
					<div v-on:click="open_stream(bubble)" class="artist-bubble" v-bind:style="{ backgroundImage: 'url(' + bubble.url + ')' }">
						<span v-bind:id="bubble.id">{{bubble.name}}</span>
					</div>
				</div>
			</div>
		</div>
		<div class="listen-section">

		</div>
		<div class="stream-section">
			<div class="player" v-if="show_player">
				<div v-if="device_id != ''">
					<button v-if="current_track.playing == true" v-on:click="pause()">Pause</button> 
					<button v-if="current_track.playing == false" v-on:click="play()">Play</button>
					<button v-on:click="skip()">Skip</button>
					<button v-on:click="toggle_loop()">Loop</button>
					<h6>loop status: {{loop_status}}</h6>
					<button v-on:click="offshoot()">Offshoot</button>
					<h5>{{current_track.name}}</h5>
					<h5>{{current_track.artist_name}}</h5>
					<h5>{{current_track.album}}</h5>
					<button v-if="current_track.song_saved == false" v-on:click="save_song(current_track.id)">Save Song</button>
					<button v-if="current_track.song_saved == true" v-on:click="unsave_song(current_track.id)">Unsave Song</button>
					<hr>
					<div v-if="playlist.tracks">
						<h5>{{playlist.tracks.items[current_track.playlist_index + 1].track.name}}</h5>
					</div>
				</div>
				<script src="https://sdk.scdn.co/spotify-player.js"></script>
			</div>
		</div>
	</div>
	<my-footer/>
  </div>
</template>

<script>
import axios from "~/plugins/axios";
import MyTree from '~/components/tree.vue'
import MyHeader from '~/components/Header.vue'
import MyFooter from '~/components/Footer.vue'


import spotify_endpoints from "../services/spotify_endpoints.js";
import firebase_endpoints from "../services/firebase_endpoints.js";
import { setInterval } from 'timers';


export default {
	components: {
		MyTree,
		MyHeader,
		MyFooter
	},
	data() {
		return {
			searchAtTop: false,
			animateHide: false,
			artistBubbles: [],
			token: '',
			title: 'Root',
			show_player: false,
			device_id: '',
			loop_status: false,
			current_track: {
				name: '',
				id: '',
				length: 0,
				album: '',
				image: {
					src: ''
				},
				artist_id: '',
				artist_name: '',
				time: 0,
				playing: null,
				song_saved: false,
				playlist_index: -1
			},
			loop_track_ids: '',
			playlist: {},
			almost_over: false
		}
	},
	methods: {
		searchHandler: function(val) {
			if (val != '') {
				spotify_endpoints.search_band(val, this.token).then( (resolved_results) => {
					this.artistBubbles = resolved_results;
				});
			}
			else {
				this.set_artist_bubbles(this.$store.state.user.top_artists);
			}
			
		},
		logout: function() {
			this.$store.commit("store_user", {});
			this.$router.push("/");
			sessionStorage.clear();
		},
		millisToMinutesAndSeconds: function(millis) {
			var minutes = Math.floor(millis / 60000);
			var seconds = ((millis % 60000) / 1000).toFixed(0);
			return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
		},
		open_stream: function(bubble) {
			this.animateHide = true;
			setTimeout( () => {
				this.searchAtTop = true;
			}, 1000);
			this.artistBubbles = null;
			this.artistBubbles = [bubble];
			this.title = "Tree";
			this.show_player = true;
			window.onSpotifyWebPlaybackSDKReady = function(){
				const token = this.token;
				const player = new Spotify.Player({
					name: 'Band Finder',
					getOAuthToken: cb => {
						cb(token);
					}
				});

				// Error handling
				player.addListener('initialization_error', ({ message }) => { console.error(message); });
				player.addListener('authentication_error', ({ message }) => { console.error(message); });
				player.addListener('account_error', ({ message }) => { console.error(message); });
				player.addListener('playback_error', ({ message }) => { console.error(message); });

				player.addListener('player_state_changed', function(state) {
					// console.log(state);
					if (!state.paused) {
						if (this.current_track.length > 0 && state.position >= this.current_track.length - 20000) {
							this.almost_over = true;
						}
						//if a new track has loaded
						if (state.position == 0 && this.current_track.id != state.track_window.current_track.id) {
							this.current_track = {
								id: state.track_window.current_track.id,
								name: state.track_window.current_track.name,
								album: state.track_window.current_track.album.name,
								image: state.track_window.current_track.album.images[0].url || null,
								artist_name: state.track_window.current_track.artists[0].name,
								artist_id: state.track_window.current_track.artists[0].uri.split("spotify:artist:")[1],
								length: state.track_window.current_track.duration_ms,
								time: state.position,
								playing: true,
								playlist_index: this.current_track.playlist_index + 1,
								song_saved: this.current_track.song_saved
							};
							this.artist_discovered(this.current_track.artist_id);
							this.almost_over = false;
							if (this.loop_status) {
								this.loop();
							}
						}
						this.current_track = {
							id: state.track_window.current_track.id,
							name: state.track_window.current_track.name,
							album: state.track_window.current_track.album.name,
							image: state.track_window.current_track.album.images[0].url || null,
							artist_name: state.track_window.current_track.artists[0].name,
							artist_id: state.track_window.current_track.artists[0].uri.split("spotify:artist:")[1],
							length: state.track_window.current_track.duration_ms,
							time: state.position,
							playing: true,
							playlist_index: this.current_track.playlist_index,
							song_saved: this.current_track.song_saved
						};
					}
					else if (state.paused) {
						this.current_track.playing = false;
						if (state.position == 0 && this.almost_over) {
							this.play_next();
						}
					}
				}.bind(this));

				// Ready
				player.addListener('ready', function({ device_id }) {
					this.device_id = device_id;
					this.prepare_playlist(bubble.id, false);
				}.bind(this));

				player.connect();
			}.bind(this);
		},
		set_artist_bubbles: function(top_artists) {
			let artists_chosen = [];
			let artist_map = {};
			this.randomProperty = function(obj) {
				var keys = Object.keys(obj)
				let field_number = keys.length * Math.random() << 0;
				return {
					name: obj[keys[field_number]],
					id: keys[field_number]
				};
			};
			for (let i = 0; i < 20; i++) {
				let random_artist = this.randomProperty(top_artists);
				if (!artist_map[random_artist.id]) {
					artist_map[random_artist.id] = random_artist;
					artists_chosen.push(random_artist);
				}
				else {
					while (artist_map[random_artist.id]) {
						random_artist = this.randomProperty(top_artists);
					}
					artist_map[random_artist.id] = random_artist;
					artists_chosen.push(random_artist);
				}
			}


			this.load_all_artists = function(artists) {
				let artist_promises = [];
				artists.forEach( (artist) => {
					artist_promises.push(spotify_endpoints.get_artist_image(artist.id, this.token));
				});
				this.handle_all = function(results) {
					this.artistBubbles = results;
				};
				Promise.all(artist_promises).then(this.handle_all.bind(this));
			}
			
			this.load_all_artists(artists_chosen);
		},
		prepare_playlist: function(artist_id, offshoot) {
			spotify_endpoints.get_playlist(artist_id, this.token, this.$store.state.user.id).then( function(playlist) {
				if (!offshoot) {
					this.playlist = playlist;
					spotify_endpoints.set_track(this.playlist.tracks.items[0].track.uri, this.token, this.device_id).then( function(){
					}.bind(this), function(error) {
						console.log(error);
					});
				}
				else {
					let first_track = this.playlist.tracks.items[this.current_track.playlist_index];
					this.playlist = playlist;
					this.playlist.tracks.items.splice(0, 0, first_track);
				}
			}.bind(this));
		},
		pause: function() {
			spotify_endpoints.pause(this.token).then( function() {
				console.log("paused");
			}.bind(this));
		},
		play: function() {
			spotify_endpoints.play(this.token).then( function() {
			}.bind(this));
		},
		play_next: function() {
			spotify_endpoints.set_track(this.playlist.tracks.items[this.current_track.playlist_index + 1].track.uri, this.token, this.device_id).then( function() {
			}.bind(this));
		},
		skip: function() {
			let next_song_uri = this.playlist.tracks.items[this.current_track.playlist_index + 1].track.uri;
			spotify_endpoints.set_track(next_song_uri, this.token, this.device_id).then( function() {
				console.log("skipping");
			}.bind(this));
		},
		save_song: function(song_id) {
			spotify_endpoints.save_song(song_id, this.token).then( function(save_result) {
				this.current_track.song_saved = true;
			}.bind(this));
		},
		artist_discovered: function() {
			firebase_endpoints.artist_discovered(this.current_track.artist_id, this.current_track.artist_name, this.token).then( function(result){
				console.log(result);
			});
		},
		unsave_song: function(song_id) {
			spotify_endpoints.unsave_song(song_id, this.token).then( function(unsave_result) {
				this.current_track.song_saved = false;
			}.bind(this));
		},
		toggle_loop: function() {
			this.loop_status = !this.loop_status;
			if (this.loop_status) {
				this.loop_track_ids += this.current_track.id + ",";
				this.loop();
			}
			else {
				this.unloop();
			}
		},
		loop: function() {
			spotify_endpoints.loop(this.current_track, this.$store.state.user, this.loop_track_ids, this.playlist).then( function(track) {
				this.playlist.tracks.items.splice(this.current_track.playlist_index + 1, 0, {track: track});
				this.loop_track_ids += track.id + ",";
			}.bind(this));
		},
		unloop: function() {
			spotify_endpoints.unloop(this.playlist, this.current_track, this.$store.state.user.id, this.token).then( function(playlist) {
				this.playlist = playlist;
			}.bind(this));
		},
		offshoot: function() {
			this.prepare_playlist(this.current_track.artist_id, true);
		}
		
	},
	beforeMount() {
		var images = this.artist_images;
		if (sessionStorage.getItem("showgo_user") !== "undefined" && sessionStorage.getItem("showgo_user") !== null) {
			this.$store.commit('store_user', JSON.parse(sessionStorage.getItem("showgo_user")));
			this.token = JSON.parse(sessionStorage.getItem("showgo_user")).spotify_access_token;
			this.set_artist_bubbles(this.$store.state.user.top_artists);
		} else {
			this.logout();
		}
	}
};

</script>

<style scoped>
.invisible {
	visibility: hidden !important;
}
.mdl-layout__content {
	padding: 10px;
}
.mdl-layout__header-row {
	padding: 0 16px 0 16px;
}
.search-bar {
	display: flex;
	align-items: center;
	margin-bottom: 20px;
}
.title-image {
	margin: auto;
}
.title-image img {
	height: 56px;
}
.search-section {
	position: relative;
}
.search-bar input {
	border: none;
	outline: none;
	border-bottom: solid lightgrey 1px;
	margin: auto;
	height: 40px;
	font-size: 18px;
	width: 90vw;
}
.search-icon{
	color: lightgrey;
	cursor: pointer;
	display: inline;
}
.search-icon.header-search {
	position: absolute;
	right: 16px;
	top: 14px;
}
.results-container {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
}
.bubble-container {
	display: inline-block;
	flex-grow: 1;
	width: 25%;
	flex: 1 0 200px;
	margin: 0 auto;
}
.artist-bubble {
	width: 150px;
	display: block;
	height: 150px;
	margin: 10px auto;
	border-radius: 50%;
	background-color: lightgrey;
	background-size: contain;
	animation: animate 3s linear infinite;
	font-size: 20px;
	text-align: center;
	font-family: verdana, sans-serif;
	cursor: pointer;
}
.search-section.animatehide {
	animation-name: hide-search-section;
	animation-duration: 1s;
	animation-iteration-count: 1;
	animation-fill-mode: forwards;
}
@keyframes hide-search-section {
	from {top: 0;}
	to {top: -130px;}
}


/* OLD STUFF BELOW */
.active {
	text-decoration: underline;
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
