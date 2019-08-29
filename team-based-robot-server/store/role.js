export const state = () => ({
  roles: [],
  total: 0,
})

export const mutations = {
  setRoles (state, data) {
    state.roles = data.roles
    state.total = data.total
  },
}

export const actions = {
  async fetchRoles ({ commit }) {
    try {
      const { data } = await this.$axios.$get("/api/role/list")
      commit("setRoles", data)
    } catch (error) {
      throw error
    }
  },
}

export const getters = {
  getRoles (state) {
    return state.roles
  },
  getRolesWithoutAdmin (state) {
    return state.roles.filter(x => x.role_name !== "ADMIN")
  },
  getTeamLeaderRole (state) {
    const [role] = state.roles.filter(x => x.role_name === "TEAM_LEADER")
    return role || {}
  },
}
