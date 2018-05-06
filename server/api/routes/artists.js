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
		Promise.all([from_spotify(artist_id, token)]).then( (similar_bands) => {
			let band_mapping = {};
			similar_bands.forEach( (band_id) => {
				band_mapping[band_id] = band_id;
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
		});
	});

	return from_spotify_promise;
}

function from_bandcamp() {
	let from_bandcamp_promise = new Promise( (resolve) => {
		
	});

	return from_bandcamp_promise;
}

function from_lastfm() {
	let from_lastfm_promise = new Promise( (resolve) => {
		
	});

	return from_lastfm_promise;
}


module.exports = router;
