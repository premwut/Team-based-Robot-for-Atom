import Cookie from "cookie"
import JSCookie from "js-cookie"
import Vue from "vue"
// import axios from "./axios"

// Called only on client-side
export const getCookies = (str) => {
  return Cookie.parse(str || "")
}

/*
** Executed by ~/.nuxt/index.js with context given
** This method can be asynchronous
*/
export default ({ req }, inject) => {
  // forword cookies for server-side
  // if (process.server) {
  //   axios.defaults.headers.common["cookie"] = req.headers.cookie
  // }

  // Inject `cookies` key
  // -> app.$cookies
  // -> this.$cookies in vue components
  // -> this.$cookies in store actions/mutations
  inject("cookies", new Vue({
    data: () => ({
      cookies: getCookies(process.server ? req.headers.cookie : document.cookie),
    }),
    methods: {
      set (...args) {
        JSCookie.set(...args, { expires: 3 })
        if (process.client) {
          this.cookies = getCookies(document.cookie)
        }
      },
      remove (...args) {
        JSCookie.remove(...args)
        this.cookies = getCookies(document.cookie)
      },
    },
  }))
}
