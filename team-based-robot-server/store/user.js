
export const state = () => ({
  users: { list: [] },
  memberUsers: [],
})

export const mutations = {
  setUsers (state, userInfo) {
    state.users = {
      ...userInfo,
      list: [...userInfo.users],
    }
    delete state.users.users
  },
  setUserMember (state, data) {
    state.memberUsers = data.users
  },
}

export const actions = {
  async fetchUsers ({ commit }, { page = 1, limit = 10 } = {}) {
    try {
      const { data } = await this.$axios.$get(`/api/user/list?page=${page}&limit=${limit}`)
      commit("setUsers", data)
    } catch (error) {
      throw error
    }
  },
  async fetchMemberUsers ({ commit }) {
    try {
      const { data } = await this.$axios.$get("/api/user/members")
      commit("setUserMember", data)
    } catch (error) {
      throw error
    }
  },
  async createUser ({ dispatch }, params) {
    try {
      const { data } = await this.$axios.$post("/api/user/create", params)
      dispatch("fetchUsers")
      return data
    } catch (error) {
      throw error
    }
  },
  async editUser ({ dispatch }, params) {
    try {
      const { usr_id } = params
      const { data } = await this.$axios.$put(`/api/user/${usr_id}/edit`, params)
      dispatch("fetchUsers")
      return data
    } catch (error) {
      throw error
    }
  },
  async deleteUser ({ dispatch }, params) {
    try {
      const { usr_id } = params
      const { data } = await this.$axios.$delete(`/api/user/${usr_id}/delete`)
      dispatch("fetchUsers")
      return data
    } catch (error) {
      throw error
    }
  },
  async editProfile (ctx, params) {
    try {
      const { data } = await this.$axios.$put("/api/user/profile", params)
      return data
    } catch (error) {
      throw error
    }
  },
}

export const getters = {
  getUsers (state) {
    return state.users
  },
  getUserMembers (state) {
    return state.memberUsers
  },
}
