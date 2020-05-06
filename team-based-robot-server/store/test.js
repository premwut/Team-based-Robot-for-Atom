/* eslint-disable no-constant-condition */
/* eslint-disable no-unused-vars */
export const state = () => ({
  tests: { list: [] },
  testcases: { list: [] },
  keywords: { list: [] },
})

export const mutations = {
  // set tests into store
  setTests (state, { data, members }) {
    // console.log("In setTests Mutation data ===>", data)
    // console.log("In setTests Mutation members ===>", members)
    const findFullname = (acc, member) => {
      const { usr_id, usr_fname, usr_lname } = member
      const usr_fullname = usr_fname + " " + usr_lname
      acc[usr_id] = usr_fullname
      return acc
    }
    const fullnameDict = members.reduce(findFullname, {})
    console.log("fullname Dict ===>", fullnameDict)
    const addUserFullname = (test) => {
      return { ...test, usr_fullname: fullnameDict[test.usr_id] }
    }
    const newTestList = data.tests.map(addUserFullname)
    state.tests = {
      ...data,
      list: [...newTestList],
    }
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
        tc_id,
        tc_name,
        tc_passed,
        tc_starttime,
        tc_endtime,
        tc_elapsed,
        created_at,
        kwd_id,
        kwd_name,
        kwd_starttime,
        kwd_endtime,
        kwd_elapsed,
        kwd_passed,
        kwd_status,
      } = cur
      const kwdTemp = { kwd_id, kwd_name, kwd_starttime, kwd_endtime, kwd_elapsed, kwd_passed, kwd_status }
      acc.kwd_list = [...acc.kwd_list, kwdTemp]
      if (idx === src.length - 1 || tc_id !== src[idx + 1].tc_id) {
        const tcTemp = {
          tc_id,
          tc_name,
          tc_passed,
          tc_starttime,
          tc_endtime,
          tc_elapsed,
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
  // set keywords into store
  setKeywords (state, { tc_id }) {
    const keywordFilter = (tc) => tc.tc_id === tc_id
    const [keywordList] = state.testcases.list.filter(keywordFilter).map((tc) => tc.kwd_list)
    state.keywords = {
      list: keywordList,
    }
    console.log("kwdList ====>", keywordList)
  },
}
// get tests from database then [setTests]
export const actions = {
  async fetchTests ({ commit, dispatch }, { page = 1, limit = 10, team_id = 1 } = {}) {
    try {
      console.log(`/api/test/list?date=2020-03-02&page=${page}&limit=${limit}`)
      const { data } = await this.$axios.$get(`/api/test/list?date=2020-03-02&page=${page}&limit=${limit}`)
      const { data: { members } } = await this.$axios.$get(`/api/team/${team_id}/members`)
      console.log("[store->test->action] :\n", data)
      commit("setTests", { data, members })
    } catch (error) {
      throw error
    }
  },
  async fetchTestcases ({ commit, dispatch }, { test_id, page = 1, limit = 10 } = {}) {
    try {
      console.log(`[test store] In action - fetchTestcase\ntest_id ===> ${test_id}`)
      console.log("test_id ===>", test_id)
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
      console.log(`[test store] In action - fetchKeyword\ntc_id ===> ${tc_id}`)
      if (tc_id !== undefined) { commit("setKeywords", { tc_id }) }
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
