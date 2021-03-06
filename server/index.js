import express from 'express'
import { Nuxt, Builder } from 'nuxt'

// import api from './api'

const app = express()
const host = process.env.HOST || '127.0.0.1'
const port = process.env.PORT || 3000

var spotify_login = require('./api/routes/spotify_login');
var user_changes = require('./api/routes/user_changes');
var artists = require('./api/routes/artists');
var users = require('./api/routes/users');


app.set('port', port)

// Import API Routes
app.use('/api/spotify_login', spotify_login);
app.use('/api/user_changes', user_changes);
app.use('/api/artists', artists);
app.use('/api/users', users);


// Import and Set Nuxt.js options
let config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

// Init Nuxt.js
const nuxt = new Nuxt(config)

// Build only in dev mode
if (config.dev) {
  const builder = new Builder(nuxt)
  builder.build()
}

// Give nuxt middleware to express
app.use(nuxt.render)

// Listen the server
app.listen(port, host)
console.log('Server listening on ' + host + ':' + port) // eslint-disable-line no-console
