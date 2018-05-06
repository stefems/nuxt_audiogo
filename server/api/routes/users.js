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

module.exports = router;
