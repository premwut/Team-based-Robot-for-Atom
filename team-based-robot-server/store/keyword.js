export const state = () => ({
  keywords: { list: [] },
})

export const mutations = {
  setKeywords (state, data) {
    state.keywords = {
      ...data,
      list: [...data.keywords],
    }
    delete state.keywords.keywords
  },
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

export const actions = {
  async fetchKeywords ({ commit, dispatch }, { page = 1, limit = 10 } = {}) {
    try {
      const { data } = await this.$axios.$get(`/api/keyword/list?page=${page}&limit=${limit}`)
      commit("setKeywords", data)
      const keywordNames = data.keywords.map(x => x.kwd_name)
      await dispatch("verifyKeywords", keywordNames)
    } catch (error) {
      throw error
    }
  },
  async verifyKeywords ({ commit }, keywordNames = []) {
    try {
      const { data } = await this.$axios.$post("/api/keyword/name/verify", { keywordNames })
      commit("applyKeywords", data)
    } catch (error) {
      throw error
    }
  },
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

export const getters = {
  getKeywords (state) {
    return state.keywords
  },
}
