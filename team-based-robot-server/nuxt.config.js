const nodeExternals = require("webpack-node-externals")

module.exports = {
  /*
  ** Headers of the page
  */
  head: {
    title: "Team-Based Robot",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui" },
      { hid: "description", name: "description", content: "team-based robot web application" },
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
      { rel: "stylesheet", type: "text/css", href: "https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons" },
      { rel: "stylesheet", type: "text/css", href: "https://use.fontawesome.com/releases/v5.0.13/css/all.css" },
    ],
  },
  loading: {
    color: "#00695C",
    height: "3px",
  },
  plugins: [
    "~/plugins/vuetify",
    "~/plugins/cookies",
    "~/plugins/axios",
  ],
  modules: [
    "@nuxtjs/axios",
  ],
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
    baseURL: process.env.API_URL,
    credentials: false,
    debug: false,
    retry: {
      retries: 0,
    },
  },
  /*
  ** Global CSS
  */
  css: [
    "~/assets/css/app.styl",
    "~/assets/css/main.scss",
  ],
  /*
  ** Add axios globally
  */
  build: {
    vendor: ["axios", "vuetify"],
    extractCSS: true,
    /*
    ** Run ESLINT on save
    */
    extend (config, ctx) {
      if (ctx.isClient) {
        config.module.rules.push({
          enforce: "pre",
          test: /\.(js|vue)$/,
          loader: "eslint-loader",
          exclude: /(node_modules)/,
        })
      }

      if (ctx.isServer) {
        config.externals = [
          nodeExternals({
            whitelist: [/^vuetify/],
          }),
        ]
      }

      if (ctx.isDev) {

      }
    },
  },
}
