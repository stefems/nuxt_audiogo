module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: 'starter',
    meta: [
	  { charset: 'utf-8' },
	  {"http-equiv": "X-UA-Compatible", content: "IE=edge"},
      { name: 'viewport', content: 'width=device-width, initial-scale=1.0, minimum-scale=1.0' },
      { hid: 'description', name: 'description', content: 'Discover Your Next Favorite Band.' }
    ],
    link: [
	  { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
	  { rel: 'stylesheet', href: "https://fonts.googleapis.com/css?family=Roboto:regular,bold,italic,thin,light,bolditalic,black,medium&amp;lang=en" },
	  { rel: 'stylesheet', href: "https://fonts.googleapis.com/icon?family=Material+Icons" },
	  { rel: 'stylesheet', href: "https://code.getmdl.io/1.3.0/material.min.css" },
	  { rel: "stylesheet", href: "styles.css"}
    ]
  },
  /*
  ** Global CSS
  */
  css: ['~/assets/css/main.css'],
  /*
  ** Add axios globally
  */
  build: {
    vendor: ['axios'],
    /*
    ** Run ESLINT on save
    */
    extend (config, ctx) {
      if (ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          exclude: /(node_modules)/
        })
      }
    }
  }
}
