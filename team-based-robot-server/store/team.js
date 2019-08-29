export const state = () => ({
  teams: { list: [] },
  allTeam: [],
  members: [],
})

export const mutations = {
  setTeams (state, data) {
    state.teams = {
      ...data,
      list: [...data.teams],
    }
    delete state.teams.teams
  },
  setAllTeam (state, data) {
    state.allTeam = data.teams || []
  },
  setMembers (state, data) {
    state.members = data.members || []
  },
}

export const actions = {
  async fetchTeams ({ commit }, { page = 1, limit = 10 } = {}) {
    try {
      const { data } = await this.$axios.$get(`/api/team/list?page=${page}&limit=${limit}`)
      commit("setTeams", data)
    } catch (error) {
      throw error
    }
  },
  async fetchAllTeam ({ commit }) {
    try {
      const { data } = await this.$axios.$get("/api/team/list")
      commit("setAllTeam", data)
    } catch (error) {
      throw error
    }
  },
  async fetchMember ({ commit }, team_id) {
    try {
      const { data } = await this.$axios.$get(`/api/team/${team_id}/members`)
      commit("setMembers", data)
    } catch (error) {
      throw error
    }
  },
  async createTeam ({ dispatch }, params) {
    try {
      const { data } = await this.$axios.$post("/api/team/create", params)
      dispatch("fetchTeams")
      return data
    } catch (error) {
      throw error
    }
  },
  async editTeam ({ dispatch }, params) {
    try {
      const { team_id } = params
      const { data } = await this.$axios.$put(`/api/team/${team_id}/edit`, params)
      dispatch("fetchTeams")
      return data
    } catch (error) {
      throw error
    }
  },
  async deleteTeam ({ dispatch }, params) {
    try {
      const { team_id } = params
      const { data } = await this.$axios.$delete(`/api/team/${team_id}/delete`)
      dispatch("fetchTeams")
      return data
    } catch (error) {
      throw error
    }
  },
  async saveMembers (ctx, { team_id = 1, addMembers = [], removeMembers = [] } = {}) {
    try {
      const params = { addMembers, removeMembers }
      const { data } = await this.$axios.$put(`/api/team/${team_id}/save-members`, params)
      return data
    } catch (error) {
      throw error
    }
  },
  async saveTeam (ctx, params) {
    try {
      const { team_id } = params
      const { data } = await this.$axios.$put(`/api/team/${team_id}/update`, params)
      return data
    } catch (error) {
      throw error
    }
  },
}

export const getters = {
  getTeams (state) {
    return state.teams
  },
  getAllTeam (state) {
    return state.allTeam
  },
  getMembers (state) {
    return state.members
  },
}
