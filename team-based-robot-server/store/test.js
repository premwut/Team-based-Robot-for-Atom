export const state = () => ({
  tests: { list: [] },
})

export const mutations = {
  // set tests into store
  setTests (state, data) {
    console.log("In setTests Mutation", data)
    state.tests = {
      ...data,
      list: [...data.tests],
    }
    console.log("After set state = ", state.tests)
    delete state.tests.data
    console.log("[store->test->mutation] :\n", state.tests.list)
  },
}
// get tests from database then [setTests]
export const actions = {
  async fetchTests ({ commit, dispatch }, { page = 1, limit = 10 } = {}) {
    try {
      console.log(`/api/test/list?date=2020-03-02&page=${page}&limit=${limit}`)
      const { data } = await this.$axios.$get(`/api/test/list?date=2020-03-02&page=${page}&limit=${limit}`)
      console.log("[store->testcase->action] :\n", data)
      commit("setTests", data)
    } catch (error) {
      throw error
    }
  },

  // delete testcases in database then [fetchTestcases]
  // async deleteTestcases ({ dispatch }, params) {
  //   try {
  //     const tc_id_list = params
  //     const { data } = await this.$axios.$post("/api/test/list", tc_id_list)
  //     dispatch("fetchTests")
  //     return data
  //   } catch (error) {
  //     throw error
  //   }
  // },
}
// get testcases from store
export const getters = {
  getTests (state) {
    return state.tests
  },
}
