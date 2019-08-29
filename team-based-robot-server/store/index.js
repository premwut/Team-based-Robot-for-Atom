import base64 from "base-64"
import { getCookies } from "../plugins/cookies"

export const state = () => ({
  notify: { isShow: false, msg: "Welcome to Team-based Robot" },
  currentUser: undefined,
  currentTeam: undefined,
  features: [],
})

export const mutations = {
  setNotify (state, { isShow, msg }) {
    state.notify = { isShow, msg }
  },
  setCurrentUser (state, userInfo) {
    state.currentUser = userInfo
    delete state.currentUser.token
  },
  setCurrentTeam (state, team) {
    state.currentTeam = team
  },
  setToken (state, token) {
    this.$axios.setToken(token)
    this.$cookies.set("auth.token", token)
  },
  setFeatures (state, features) {
    state.features = features.map(item => {
      const { feature: name, permission } = item
      return {
        feature: name,
        permission,
        read: permission === "READ",
        write: permission === "WRITE",
      }
    })
  },
  clearToken (state) {
    this.$axios.setToken(false)
    this.$cookies.remove("auth.token")
  },
  clearCurrentUser (state) {
    state.currentUser = undefined
  },
}

export const actions = {
  nuxtServerInit ({ commit }, { req }) {
    const cookies = getCookies(req.headers.cookie)
    const token = cookies["auth.token"]
    if (token) {
      commit("setToken", token)
    }
  },
  updateAxiosAuthorization ({ commit }) {
    const token = this.$cookies.cookies["auth.token"]
    if (token) {
      commit("setToken", token)
      console.log("[Auth] Set authorization to axios")
    } else {
      console.log("[Auth] Remove authorization from axios")
      commit("clearToken")
    }
  },

  async login ({ commit, dispatch }, { username, password }) {
    try {
      const url = "/api/auth/login"
      const basicAuth = "Basic " + base64.encode(`${username}:${password}`)
      const { data } = await this.$axios.$post(url, {}, { headers: { authorization: basicAuth } })
      commit("setToken", data.token)
      commit("setCurrentUser", data)
      await dispatch("fetchFeature")
    } catch (error) {
      throw error
    }
  },

  async changePassword ({ commit, dispatch }, { password, currentPassword }) {
    try {
      const uri = "/api/auth/password/change"
      const params = {
        password: currentPassword,
        newPassword: password,
        reNewPassword: password,
      }
      const { data } = await this.$axios.$post(uri, params)
      commit("setToken", data.token)
      commit("setCurrentUser", data)
      await dispatch("fetchFeature")
    } catch (error) {
      throw error
    }
  },

  async verifyToken ({ commit, dispatch }, token) {
    try {
      const url = "/api/user/profile"
      const { data } = await this.$axios.$get(url, { headers: { authorization: token } })
      commit("setToken", token)
      commit("setCurrentUser", data)
      await dispatch("fetchFeature")
      return data
    } catch (error) {
      throw error
    }
  },

  async fetchProfile ({ commit }) {
    try {
      const url = "/api/user/profile"
      const { data } = await this.$axios.$get(url)
      commit("setCurrentUser", data)
      return data
    } catch (error) {
      throw error
    }
  },

  async fetchCurrentTeam ({ commit, state }, team_id = 1) {
    try {
      const { data } = await this.$axios.$get(`/api/team/${team_id}/info`)
      commit("setCurrentTeam", data)
    } catch (error) {
      throw error
    }
  },

  async fetchFeature ({ commit }) {
    try {
      const { data } = await this.$axios.$get("/api/user/features")
      commit("setFeatures", data.features)
    } catch (error) {
      throw error
    }
  },

  logout ({ commit }) {
    commit("clearToken")
    commit("clearCurrentUser")
  },

  showNotify ({ commit }, message) {
    commit("setNotify", { isShow: true, msg: message })
  },

  hideNotify ({ commit }) {
    commit("setNotify", { isShow: false, msg: "" })
  },
}

export const getters = {
  getFeatures (state) {
    return state.features
  },
  getNotify (state) {
    return state.notify
  },
  getCurrentUser (state) {
    return state.currentUser
  },
  getCurrentTeam (state) {
    return state.currentTeam
  },
}
