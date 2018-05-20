//Node Utils_______________________
const request = require('request');
const jsdom = require('jsdom');
var querystring = require('querystring');
const { JSDOM } = jsdom;
const fs = require('fs');
const express = require('express');
const router = express.Router();
var env;
require("../env_util.js").then( (env_to_use) => {
	env = env_to_use;
});
var login_utils = require("../route_utils/login_utils.js");
var firebase_utils = require("../route_utils/firebase_utils.js");


router.get('/me', function(req, res) {
	let token = req.query.access_token;
	firebase_utils.get_user_from_token(token).then( (user) => {
		if (user) {
			res.send(user);
		}
		else {
			res.status(404).send("User with token not found. This token has probably expired or the token is incorrect.");
		}
	});
});

router.put("/discover", function(req, res) {
	let token = req.query.access_token;
	let artist = {};
	artist.id = req.query.artist_id;
	artist.name = req.query.artist_name;
	firebase_utils.get_user_from_token(token).then( (user) => {
		if (user) {
			firebase_utils.add_artist(user, artist);
		}
		req.send("mhm");
	});
});

module.exports = router;
