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
      console.log(testcases)
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

  async saveKeywords(keywordInfo) {
    try {
      const url = `/keyword/create`
      const { data: response } = await this.axios.post(url, keywordInfo, this.headerToken)
      this.socket.emit('keywordUpdated', {id: this.socket.id})
      console.log(response)
      return [...response.data.keywords]
    } catch (e) {
      throw e
    }
  }

  async saveTestcaseRun(testcaseInfo) {
    try {
      const url = `/testcase/create`
      const { data: response } = await this.axios.post(url, testcaseInfo, this.headerToken)
      console.log(response, 'response')
      return [ ...response.data ]
    } catch (e) {
      console.log(e)
      throw e
    }
  }

  async deleteKeyword(kdywordId) {
    try {
      const url = `/keyword/${kdywordId}/delete`
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
}
