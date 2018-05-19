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
			<hr>
			<div v-if="playlist.tracks">
				<h5>{{playlist.tracks.items[current_track.playlist_index + 1].track.name}}</h5>
			</div>
		</div>
		<script src="https://sdk.scdn.co/spotify-player.js"></script>
	</div>

  </section>
</template>

<script>
import axios from "~/plugins/axios";
import spotify_endpoints from "../services/spotify_endpoints.js";
import { setInterval } from 'timers';


export default {
	data() {
		return {
			artist_bubbles: [],
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
				playlist_index: -1
			},
			loop_track_ids: '',
			playlist: {},
			almost_over: false
		}
	},
	methods: {
		millisToMinutesAndSeconds: function(millis) {
			var minutes = Math.floor(millis / 60000);
			var seconds = ((millis % 60000) / 1000).toFixed(0);
			return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
		},
		open_stream: function(bubble) {
			this.artist_bubbles = [bubble];
			this.title = "Tree";
			this.show_player = true;
			window.onSpotifyWebPlaybackSDKReady = function(){
				const token = this.token;
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

				player.addListener('player_state_changed', function(state) {
					// console.log(state);
					if (!state.paused) {
						if (this.current_track.length > 0 && state.position >= this.current_track.length - 20000) {
							this.almost_over = true;
						}
						//if a new track has loaded
						if (state.position == 0 && this.current_track.id != state.track_window.current_track.id) {
							console.log("new track loaded");
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
								playlist_index: this.current_track.playlist_index + 1
							};
							this.almost_over = false;
							if (this.loop_status) {
								console.log("adding a looped song");
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
							playlist_index: this.current_track.playlist_index
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
					this.prepare_playlist(this.artist_bubbles[0].id);
				}.bind(this));

				player.connect();
			}.bind(this);
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
		},
		prepare_playlist: function(artist_id, offshoot) {
			spotify_endpoints.get_playlist(artist_id, this.token, this.$store.state.user.id).then( function(playlist) {
				this.playlist = playlist;
				console.log(playlist);
				spotify_endpoints.set_track(this.playlist.tracks.items[0].track.uri, this.token, this.device_id).then( function(){
				}.bind(this), function(error) {
					console.log(error);
				});
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
			spotify_endpoints.skip(this.token).then( function() {
				console.log("skipping");
			}.bind(this));
		},
		toggle_loop: function() {
			this.loop_status = !this.loop_status;
			if (this.loop_status) {
				this.loop_track_ids += this.current_track.id + ",";
				//queue song
				this.loop();
			}
			else {
				//unqueue song
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
			console.log("removing queued loop song");
			//clear out the loop_track_ids
			// spotify_endpoints.loop(this.token).then( function() {
			// 	console.log("looping");
			// 	//get one track from this artist
			// 	//insert this track after the current song (but make sure to insert and not wipe out the other songs in the stream.)
			// }.bind(this));
		},
		offshoot: function() {
			console.log(this.current_track.artist_id);
			//get the similar artists to this artist
			//get their tracks
			//add the tracks after the current song (thereby wiping out the previous stream's songs)
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
.active {
	text-decoration: underline;
}

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
