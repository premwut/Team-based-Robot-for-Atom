/* eslint-disable no-constant-condition */
/* eslint-disable no-unused-vars */
export const state = () => ({
  tests: { list: [] },
  testcases: { list: [] },
  keywords: { list: [] },
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
  // set testcases into store
  setTestcases (state, data) {
    console.log(`[mutation] setTestcases\ndata ===> ${data}`)
    const { testcases } = data
    const init = {
      kwd_list: [],
      tc_list: [],
    }
    const testcaseList = testcases.reduce((acc, cur, idx, src) => {
      let {
        test_map_tc_id,
        test_map_tc_name,
        test_map_tc_passed,
        created_at,
        kwd_id,
        test_kwd_name,
      } = cur
      const kwdTemp = { kwd_id, kwd_name: test_kwd_name }
      acc.kwd_list = [...acc.kwd_list, kwdTemp]
      if (idx === src.length - 1 || test_map_tc_id !== src[idx + 1].test_map_tc_id) {
        const tcTemp = {
          tc_id: test_map_tc_id,
          tc_name: test_map_tc_name,
          tc_passed: test_map_tc_passed,
          created_at,
          kwd_list: [...acc.kwd_list],
        }
        acc.tc_list.push(tcTemp)
        acc.kwd_list = []
      }
      return acc
    }, init)
    state.testcases = {
      list: testcaseList.tc_list,
    }
  },
  setKeywords (state, tc_id) {
    const keywordFilter = (tc) => tc.tc_id === tc_id
    const keywordList = state.testcases.list.filter(keywordFilter).map((tc) => tc.kwd_list)
    state.keywords = { list: keywordList }
  },
}
// get tests from database then [setTests]
export const actions = {
  async fetchTests ({ commit, dispatch }, { page = 1, limit = 10 } = {}) {
    try {
      console.log(`/api/test/list?date=2020-03-02&page=${page}&limit=${limit}`)
      const { data } = await this.$axios.$get(`/api/test/list?date=2020-03-02&page=${page}&limit=${limit}`)
      console.log("[store->test->action] :\n", data)
      commit("setTests", data)
    } catch (error) {
      throw error
    }
  },
  async fetchTestcases ({ commit, dispatch }, { test_id, page = 1, limit = 10 } = {}) {
    try {
      console.log(`[test store] In action - fetchTestcase\nitem ===> ${test_id}`)
      test_id = 1
      const { data } = await this.$axios.$get(`/api/test/${test_id}/testcases?page=${page}&limit=${limit}`)
      console.log("[store->testcase->action] :\n", data)
      commit("setTestcases", data)
    } catch (error) {
      throw error
    }
  },
  async fetchKeywords ({ commit, dispatch }, { tc_id, page = 1, limit = 10 } = {}) {
    try {
      console.log(`[test store] In action - fetchTestcase\nitem ===> ${tc_id}`)
      // tc_id = 1
      commit("setKeywords", tc_id)
    } catch (error) {
      throw error
    }
  },
}
// get testcases from store
export const getters = {
  getTests (state) {
    return state.tests
  },
  getTestcases (state) {
    return state.testcases
  },
  getKeywords (state) {
    return state.keywords
  },
}
