export const state = () => ({
  testcases: { list: [] },
})

export const mutations = {
  // set testcases into store
  setTestcases (state, data) {
    console.log("Hello world from setTestcases mutation", state)
    state.testcases = {
      ...data,
      list: [...data.data],
    }
    delete state.testcases.data
  },
}
// get testcases from database then [setTestcases]
export const actions = {
  async fetchTestcases ({ commit, dispatch }, { page = 1, limit = 10 } = {}) {
    try {
      console.log(`/api/testcase/list?page=${page}&limit=${limit}`)
      const { data } = await this.$axios.$get(`/api/testcase/list?page=${page}&limit=${limit}`)
      console.log(data, "data (fetchTestcases)")
      commit("setTestcases", data)
    } catch (error) {
      throw error
    }
  },
  // delete testcases in database then [fetchTestcases]
  async deleteTestcases ({ dispatch }, params) {
    try {
      const tc_id_list = params
      const { data } = await this.$axios.$post("/api/testcase/list", tc_id_list)
      dispatch("fetchTestcases")
      return data
    } catch (error) {
      throw error
    }
  },
}
// get testcases from store
export const getters = {
  getTestcases (state) {
    return state.testcases
  },
}
