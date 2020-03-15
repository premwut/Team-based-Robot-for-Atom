'use babel';

import axios from "axios"
import axiosRetry from "axios-retry"
import base64 from "base-64"
import io from "socket.io-client"

export default class Connection {

  constructor(config) {
    this.token = ""
    this.config = config
    this.axios = axios.create({
      baseURL: `${config.endpoint}/api`,
      timeout: 15000
    })
    this.socket = io(config.endpoint)
    axiosRetry(this.axios, { retries: 1 })
  }

  get headerToken () {
    return {
      headers: { authorization: this.token }
    }
  }

  updateConfig(config) {
    this.config = config
  }

  clearToken() {
    this.token = ""
  }

  async login({ username, password } = this.config) {
    try {
      // const { username, password } = this.config
      const url = `/auth/login`
      const basicAuth = 'Basic ' + base64.encode(`${username}:${password}`)
      const { data: response } = await this.axios.post(url, {}, { headers: { authorization: basicAuth } })
      this.user = { ...response.data }
      this.token = this.user.token

      this.socket.emit('joinTeamroom', this.user.team_id)

      return this.user
    } catch (error) {
      console.error("[Connection] Login failure ", error)
    }
  }

  async getFeatures() {
    try {
      const url = "/user/features"
      const { data: response } = await this.axios.get(url, this.headerToken)
      return [...response.data.features]
    } catch (e) {
      throw e
    }
  }

  async getKeywords() {
    if (this.token == "") return false;
    try {
      const url = `/keyword/shared`
      const { data: response } = await this.axios.get(url, this.headerToken)
      console.log([...response.data.keywords], 'reload keywords data')
      return [...response.data.keywords]
    } catch (e) {
      throw e
    }
  }

  async getTestcase() {
    if (this.token == "") return false;
    try {
      const url = `/testcase/list`
      const { data: testcases } = await this.axios.get(url, this.headerToken)
      return testcases
    } catch (e) {
      throw e
    }
  }

  async getProjects() {
    try {
      const url = `/project/shareable`
      const { data: response } = await this.axios.get(url, this.headerToken)
      return [...response.data.projects]
    } catch (e) {
      throw e
    }
  }

  async getTeams() {
    try {
      const url = `/team/shareable`
      const { data: response } = await this.axios.get(url, this.headerToken)
      return [...response.data.teams]
    } catch (e) {
      throw e
    }
  }

  async getUsers() {
    try {
      const url = `/user/shareable`
      const { data: response } = await this.axios.get(url, this.headerToken)
      return [...response.data.users]
    } catch (e) {
      throw e
    }
  }

  async getProfile() {
    try {
      const url = `/user/profile`
      const { data: response } = await this.axios.get(url, this.headerToken)
      return response.data
    } catch (e) {
      console.error(e)
    }
  }

  async getRoleById(userId) {
    try {
      const url = `/role/${userId}/getId`
      const { data: response } = await this.axios.get(url, this.headerToken)
      return response.data
    } catch (e) {
      throw e
    }
  }

  async saveKeywords(keywordInfo) {
    try {
      const url = `/keyword/create`
      const { data: response } = await this.axios.post(url, keywordInfo, this.headerToken)
      const { data: user } = await this.axios.get('/user/profile', this.headerToken)
            userData = user.data
      console.log(userData)
      this.socket.emit('keywordUpdated', {id: this.socket.id, username: userData.usr_fname})

      console.log(response)
      return [...response.data.keywords]
    } catch (e) {
      throw e
    }
  }

  async saveTestcaseRun(testcaseInfo) {
    try {
      const url = `/test/create`
      const { data: response } = await this.axios.post(url, testcaseInfo, this.headerToken)
      console.log(response, 'response')
      return [ ...response.data ]
    } catch (e) {
      console.log(e)
      throw e
    }
  }

  async updateTestcases(testcaseInfo) {
    console.log(testcaseInfo)
    const url = `/testcase/edit`
    const response = await this.axios.put(url, testcaseInfo, this.headerToken)
    console.log(response, 'updateTestcases')
    return 1
  }

  async deleteKeyword(kdywordId) {
    try {
      const url = `/keyword/${kdywordId}/delete`
      this.socket.emit('keywordUpdated', {id: this.socket.id})
      const { data: response } = await this.axios.delete(url, this.headerToken)
      return response.data.keywordId
    } catch (e) {
      throw e
    }
  }

  async verifyKeywordName(names) {
    try {
      const url = `/keyword/name/verify`
      const params = { keywordNames: names }
      const { data: response } = await this.axios.post(url, params, this.headerToken)
      return response.data
    } catch (e) {
      throw e
    }
  }

  async getReview(userId) {
    try {
      const url = `/review/get/${userId}`
      const { data: response } = await this.axios.get(url, this.headerToken)
      return response.data
    } catch (e) {
      throw e
    }
  }

  async submitReview(reviewData) {
    try {
      const url = `/review/submit`
      const { data: response } = await this.axios.post(url, reviewData, this.headerToken)

      if ( response.data.isExist ) {
        const { rw_id } = response.data.review
        this.editReview(reviewData, rw_id)
      }
      return response.data
    } catch (e) {
      throw e
    }
  }

  async editReview(reviewData, updateId) {
    try {
      const url = `/review/edit`
      const { data: response } = await this.axios.put(url, { reviewData, updateId}, this.headerToken)
      console.log(response, "in editReview")
    } catch (e) {
      throw e
    }
  }
}
