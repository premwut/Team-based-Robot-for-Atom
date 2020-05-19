export const state = () => ({
  keywords: { list: [] },
})

export const mutations = {
  // set keywords into store
  setKeywords (state, data) {
    state.keywords = {
      ...data,
      list: [...data.keywords],
    }
    delete state.keywords.keywords
  },
  // set the  owner of keywords
  applyKeywords (state, { keywords = [] } = {}) {
    const keywordList = state.keywords.list
    if (keywordList && keywordList.length > 0) {
      keywordList.forEach(keyword => {
        const matchKeyword = keywords.find(k => k.kwd_name === keyword.kwd_name)
        keyword.isOwner = matchKeyword && matchKeyword.isOwner
      })
    }
  },
}
// get keywords from database then [setKeywords] and [verifyKeywords]
export const actions = {
  async fetchKeywords ({ commit, dispatch }, { page = 1, limit = 10 } = {}) {
    try {
      let review = true
      const { data } = await this.$axios.$get(`/api/keyword/list?page=${page}&limit=${limit}&review=${review}`)
      commit("setKeywords", data)
      const keywordNames = data.keywords.map(x => x.kwd_name)
      await dispatch("verifyKeywords", keywordNames)
    } catch (error) {
      throw error
    }
  },
  // get keyword name that verify by user id from database then [applyKeywords]
  async verifyKeywords ({ commit }, keywordNames = []) {
    try {
      const { data } = await this.$axios.$post("/api/keyword/name/verify", { keywordNames })
      commit("applyKeywords", data)
    } catch (error) {
      throw error
    }
  },
  // delete keyword in database then [fetchKeywords]
  async deleteKeyword ({ dispatch }, params) {
    try {
      const { kwd_id } = params
      const { data } = await this.$axios.$delete(`/api/keyword/${kwd_id}/delete`)
      dispatch("fetchKeywords")
      return data
    } catch (error) {
      throw error
    }
  },
}
// get keywords from store
export const getters = {
  getKeywords (state) {
    return state.keywords
  },
}
