export const state = () => ({
  tests: { list: [] },
  testcases: { list: [] },
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
  setTestcases (state, data) {
    console.log(`[mutation] setTestcases\ndata ===> ${data}`)
    const { testcases } = data
    let pre_test_map_tc_id = 1
    let pre_test_map_tc_name = testcases[0].test_map_tc_name
    let kwdList = []
    let tcTemp = {}
    let kwdTemp = {}
    const testcaseList = []
    testcases.forEach((currentValue, idx, arr) => {
      const {
        test_map_tc_id,
        test_map_tc_name,
        test_map_tc_passed,
        kwd_id,
        test_kwd_name,
        created_at,
      } = currentValue
      kwdTemp = { kwd_id: kwd_id, kwd_name: test_kwd_name }
      tcTemp = {
        tc_id: pre_test_map_tc_id,
        tc_name: pre_test_map_tc_name,
        tc_passed: test_map_tc_passed,
        created_at,
        kwd_list: kwdList,
      }
      if (pre_test_map_tc_id !== test_map_tc_id || idx === arr.length - 1) {
        if (idx === arr.length - 1) {
          kwdList.push(kwdTemp)
        }
        testcaseList.push(tcTemp)
        tcTemp = {}
        kwdList = []
        pre_test_map_tc_id = test_map_tc_id
        pre_test_map_tc_name = test_map_tc_name
      }
      kwdList.push(kwdTemp)
    })
    state.testcases = {
      list: [...testcaseList],
    }
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
      // const { testcases } = data
      // let pre_test_map_tc_id = 1
      // let kwdList = []
      // let tcTemp = {}
      // let kwdTemp = {}
      // const normalizeTestcase = (currentValue, idx, arr) => {
      //   const {
      //     test_map_tc_id,
      //     test_map_tc_name,
      //     test_map_tc_passed,
      //     kwd_id,
      //     test_kwd_name,
      //     created_at,
      //   } = currentValue
      //   kwdTemp = { kwd_id: kwd_id, kwd_name: test_kwd_name }
      //   if (pre_test_map_tc_id === test_map_tc_id && idx !== arr.length - 1) {
      //     kwdList.push(kwdTemp)
      //   } else {
      //     tcTemp = {
      //       tc_id: test_map_tc_id,
      //       tc_name: test_map_tc_name,
      //       tc_passed: test_map_tc_passed,
      //       created_at,
      //       kwd_list: kwdList,
      //     }
      //     pre_test_map_tc_id = test_map_tc_id
      //     kwdList = []
      //     console.log(`In test store tcTemp ===> ${tcTemp}`)
      //     return tcTemp
      //   }
      // }
      // const testcaseList = testcases.map(normalizeTestcase)
      commit("setTestcases", data)
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
  getTestcases (state) {
    return state.testcases
  },
}
