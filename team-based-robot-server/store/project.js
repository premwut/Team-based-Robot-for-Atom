export const state = () => ({
  projects: { list: [] },
  allProject: [],
})

export const mutations = {
  setProjects (state, data) {
    state.projects = {
      ...data,
      list: [...data.projects],
    }
    delete state.projects.projects
  },
  setAllProject (state, data) {
    state.allProject = data.projects || []
  },
}

export const actions = {
  async fetchProjects ({ commit }, { page = 1, limit = 10 } = {}) {
    try {
      const { data } = await this.$axios.$get(`/api/project/list?page=${page}&limit=${limit}`)
      commit("setProjects", data)
    } catch (error) {
      throw error
    }
  },
  async fetchAllProject ({ commit }) {
    try {
      const { data } = await this.$axios.$get("/api/project/list")
      commit("setAllProject", data)
    } catch (error) {
      throw error
    }
  },
  async createProject ({ dispatch }, params) {
    try {
      const { data } = await this.$axios.$post("/api/project/create", params)
      dispatch("fetchProjects")
      return data
    } catch (error) {
      throw error
    }
  },
  async editProject ({ dispatch }, params) {
    try {
      const { proj_id } = params
      const { data } = await this.$axios.$put(`/api/project/${proj_id}/edit`, params)
      dispatch("fetchProjects")
      return data
    } catch (error) {
      throw error
    }
  },
  async deleteProject ({ dispatch }, params) {
    try {
      const { proj_id } = params
      const { data } = await this.$axios.$delete(`/api/project/${proj_id}/delete`)
      dispatch("fetchProjects")
      return data
    } catch (error) {
      throw error
    }
  },
}

export const getters = {
  getProjects (state) {
    return state.projects
  },
  getAllProject (state) {
    return state.allProject
  },
}
