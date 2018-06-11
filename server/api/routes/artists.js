//Node Utils_______________________
const request = require('request');
const jsdom = require('jsdom');
var querystring = require('querystring');
const { JSDOM } = jsdom;
const fs = require('fs');
const express = require('express');
const router = express.Router();
const axios = require("axios");

var env;
require("../env_util.js").then( (env_to_use) => {
	env = env_to_use;
});
var login_utils = require("../route_utils/login_utils.js");
var firebase_utils = require("../route_utils/firebase_utils.js");


router.get('/get_similar_artists/:id', function(req, res) {
	let artist_id = req.params.id;
	let token = req.query.access_token;
	get_similar_artists(artist_id, token).then( (ids) => {
		res.send(ids);
	});
});

function get_similar_artists(artist_id, token) {
	let similar_artists_promise = new Promise( function(resolve) {
		//todo: add in the other source functions from_bandcamp from_lastfm
		console.log("ke");
		Promise.all([from_spotify(artist_id, token), from_lastfm(artist_id, token)]).then( (similar_bands) => {
			let band_mapping = {};
			//todo: add in the concats for the other arrays once we add bandcamp and lastfm
			similar_bands = similar_bands[0].concat(similar_bands[1]);
			similar_bands.forEach( (band) => {
				band_mapping[band] = band;
			});
			filter_already_discovered(band_mapping, token).then( function(filtered_bands) {
				resolve(filtered_bands);
			});
		}).catch( (error) => {
			console.log(error);
			resolve(null);
		});
	});

	return similar_artists_promise;
}
function filter_already_discovered(band_map, token) {
	let filtered_promise = new Promise( (resolve) => {
		axios.get("http://localhost:3000/api/users/me?access_token=" + token).then( (result) => {
			let unique = [];
			let artists = result.data.artists;
			Object.entries(band_map).forEach(
				([key, value]) => {
					if (!artists[key]) {
						unique.push(key);
					}
					else {
						// console.log("artist " + artists[key] + " already discovered");
					}
				}
			);
			unique = unique.join();
			resolve(unique);
		}).catch( (error) => {
			console.log(error);
		});
	});

	return filtered_promise;
}
function from_spotify(artist_id, token) {
	let from_spotify_promise = new Promise( (resolve) => {
		let ids = [];
		axios.defaults.headers.common['Authorization'] = "Bearer " + token;
		axios.get("https://api.spotify.com/v1/artists/" + artist_id + "/related-artists").then( (result) => {
			Object.entries(result.data.artists).forEach(
				([key, value]) => {
					ids.push(value.id);
				}
			);
			resolve(ids);
		}).catch( (error) => {
			console.log(error);
			resolve(null);
			return;
		});
	});

	return from_spotify_promise;
}

function from_bandcamp() {
	let from_bandcamp_promise = new Promise( (resolve) => {
		
	});

	return from_bandcamp_promise;
}

function from_lastfm(artist_id, token) {
	let from_lastfm_promise = new Promise( (resolve) => {
		//use the spotify id to get the artist's name, tags, and other data
		axios.defaults.headers.common['Authorization'] = "Bearer " + token;
		let artist = { id: artist_id};
		axios.get("https://api.spotify.com/v1/artists/" + artist_id).then( (result) => {
			artist.tags = result.data.genres;
			artist.name = result.data.name;
			axios.get(lastfm_artist_search(artist.name)).then( (result) => {
				let possible_matches = result.data.results.artistmatches.artist;
				let first_match = possible_matches[0];
				//todo: implement this matching algorithm
				//find_best_lastfm_match()
				axios.get(lastfm_get_related(first_match.mbid)).then( (result) => {
					let similar_artists = result.data.similarartists.artist;
					similar_artists.forEach( (artist) => {
						//will have to fire a request for each artist and then add them...
					});
				}).catch( (error) => {
					console.log(error);
					resolve(null);
					return;
				});
				resolve(null);
			}).catch( (error) => {

			});
		}).catch( (error) => {
			console.log(error);
			resolve(null);
			return;
		});
		//send request to lastfm to get that artist.
		//use the data to compare and find the matching artist.
		//get the related artists and associated data
		//for each artist we got from lastfm we'll need to look them up on spotify
		//compare data to see if we got a match
		//add the artist id if we got a match
	});

	return from_lastfm_promise;
}

function lastfm_artist_search(name) {
	return "http://ws.audioscrobbler.com/2.0/?method=artist.search&artist=" + encodeURIComponent(name) + "&api_key=0c7713b99c389ecb790e6aafe0478c9f&format=json";
}
function lastfm_artist_info(mbid) {
	return "http://ws.audioscrobbler.com/2.0/?method=artist.getInfo&mbid=" + encodeURIComponent(mbid) + "&api_key=0c7713b99c389ecb790e6aafe0478c9f&format=json";
}
function lastfm_get_related(mbid) {
	return "http://ws.audioscrobbler.com/2.0/?method=artist.getSimilar&mbid=" + encodeURIComponent(mbid) + "&api_key=0c7713b99c389ecb790e6aafe0478c9f&format=json";
}
function find_best_lastfm_match(possible_matches, spotify_artist) {
	//possible matches don't have tags until we send a specific request to get their info
	possible_matches.forEach( (artist) => {
		console.log(artist.mbid);
	});
}

module.exports = router;
