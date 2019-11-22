import Keyword, { Keywords } from "../models/keyword.model"
import KeywordMapping, { KeywordMappings } from "../models/keywordMapping.model"
import Team, { Teams } from "../models/team.model"
import { getPagination, isPagination } from "../utilities/utils"

import BaseController from "./base.controller"
import { Fields } from "../utilities/constants"
import { Projects } from "../models/project.model"
import R from "ramda"
import { Users } from "../models/user.model"
import bookshelf from "../config/bookshelf"

export default class KeywordController extends BaseController {
  async get (req, res) {
    try {
      const { id: kwd_id } = req.params
      const keyword = await Keyword.forge({ kwd_id }).fetch({ withRelated: ["childKeywords"] })
      const subKeywords = keyword.related("childKeywords")
      const data = keyword.toJSON()
      data.subKeywords = subKeywords
      data.childKeywords = undefined
      this.success(res, data)
    } catch (error) {
      this.failure(res, error)
    }
  }

  async getList (req, res) {
    try {
      const isPaging = isPagination(req)
      const { page, limit: pageSize } = req.query
      const keywords = await (isPaging ? Keyword.forge().fetchPage({ page, pageSize }) : Keyword.forge().fetchAll())
      this.success(res, { keywords, ...getPagination(keywords) })
    } catch (error) {
      this.failure(res, error)
    }
  }

  async getSharedList (req, res) {
    try {
      const { usr_id, team_id } = req.currentUser.toJSON()
      const team = await Team.forge({ team_id }).fetch()
      const proj_id = team.get(Fields.PROJ_ID)
      const queryMapping = q => q.where({ usr_id }).orWhere({ team_id }).orWhere({ proj_id })
      const mappingCollection = await KeywordMappings.query(queryMapping).fetch()
      let mappings = []
      mappingCollection.each(m => { mappings.push(m.get(Fields.KWD_ID)) })
      const keywordIds = R.uniq(mappings)
      const queryKeyword = q => q.where(Fields.KWD_ID, "in", R.uniq(keywordIds)).orderBy(Fields.KWD_ID, "asc")
      const keywords = await Keywords.query(queryKeyword).fetch()
      this.success(res, { keywords })
    } catch (error) {
      this.failure(res, error)
    }
  }

  async verifyByNames (req, res) {
    try {
      req.check("keywordNames", "keywordNames is required").exists()
      const errors = req.validationErrors()
      if (errors) throw errors

      const { keywordNames = [] } = req.body
      const { usr_id } = req.currentUser.toJSON()
      const query = q => q.where(Fields.KWD_NAME, "in", keywordNames)
      const queryResult = await Keywords.query(query).fetch({ withRelated: ["keywordMappings"] })
      const keywords = queryResult.toJSON()
      const result = keywordNames.map(name => {
        const [match] = keywords.filter(x => x[Fields.KWD_NAME] === name)
        const shared = { projects: [], teams: [], users: [] }
        if (match) {
          const isKeywordOwner = k => k.kwd_is_owner && k.usr_id === usr_id
          const ownerKeywords = match.keywordMappings.filter(isKeywordOwner)
          shared.projects = match.keywordMappings.map(x => x.proj_id).filter(x => x !== null)
          shared.teams = match.keywordMappings.map(x => x.team_id).filter(x => x !== null)
          shared.users = match.keywordMappings.map(x => x.usr_id).filter(x => x !== null)
          const { kwd_id, kwd_name, kwd_desc, kwd_review, kwd_is_approved } = match
          console.log("Match ---")
          console.log(match)
          return {
            kwd_id,
            kwd_name,
            kwd_desc,
            kwd_review,
            kwd_is_approved,
            isExist: true,
            isOwner: ownerKeywords.length > 0,
            shared,
          }
        } else {
          return { kwd_id: -1, kwd_name: name, isExist: false, isOwner: false, shared }
        }
      })
      this.success(res, { keywords: result })
    } catch (error) {
      this.failure(res, error)
    }
  }

  async create (req, res) {
    try {
      const errors = this.validateCreateRequest(req)
      if (errors) throw errors
      const { keywords } = req.body
      const shareMapping = {}
      const keywordIds = []
      const keywordCollection = Keywords.forge()
      keywords.forEach(item => {
        const { id, name, shared } = item
        const keyword = this.convertToKeyword(item)
        shareMapping[name] = shared
        id && keywordIds.push(id)
        keywordCollection.push(keyword)
      })

      const data = await bookshelf.transaction(async (tx) => {
        const processList = [keywordCollection.invokeThen("save", null, {transacting: tx})]
        const removeMappingIds = R.uniq(keywordIds)
        removeMappingIds.length > 0 && processList.push(this.removeKeywordMapping(tx, removeMappingIds))
        const [keywordSavedList] = await Promise.all(processList)
        const allKeywords = Keywords.forge(keywordSavedList).clone()
        await this.saveKeywordMapping(tx, allKeywords, shareMapping, req.currentUser)
        return { keywords: keywordSavedList }
      })
      this.success(res, data)
    } catch (error) {
      this.failure(res, error)
    }
  }

  async removeKeywordMapping (tx, keywordIds) {
    const queryMapping = q => q.where(Fields.KWD_ID, "in", keywordIds)
    const mappingCollection = await KeywordMappings.query(queryMapping).fetch()
    return mappingCollection.invokeThen("destroy", null, {transacting: tx})
  }

  async saveKeywordMapping (tx, keywordCollection, shareMapping, owner) {
    const mappingProjects = []
    const mappingTeams = []
    const mappingUsers = []
    const mappingOwner = []
    keywordCollection.each(kw => {
      const kwd_id = kw.get(Fields.KWD_ID)
      const kwd_name = kw.get(Fields.KWD_NAME)
      const { projectIds, teamIds, userIds } = shareMapping[kwd_name]
      const kmp = projectIds.map(id => KeywordMapping.forge({ kwd_id, proj_id: id }))
      const kmt = teamIds.map(id => KeywordMapping.forge({ kwd_id, team_id: id }))
      const kmu = userIds.map(id => KeywordMapping.forge({ kwd_id, usr_id: id }))
      const kmo = [KeywordMapping.forge({ kwd_id, usr_id: owner.get(Fields.USR_ID), kwd_is_owner: true })]
      mappingProjects.push(...kmp)
      mappingTeams.push(...kmt)
      mappingUsers.push(...kmu)
      mappingOwner.push(...kmo)
    })
    const combineMapping = R.reduce(R.concat, [], [mappingOwner, mappingUsers, mappingTeams, mappingProjects])
    const mappingCollection = KeywordMappings.forge(combineMapping)
    const savedKeywordMapping = await mappingCollection.invokeThen("save", null, {transacting: tx})
    return savedKeywordMapping
  }

  async getTargetMappings ({teamIds, projectIds, userIds}) {
    const [projects, teams, users] = await Promise.all([
      Projects.query(q => q.where(Fields.PROJ_ID, "in", R.uniq(projectIds))).fetch(),
      Teams.query(q => q.where(Fields.TEAM_ID, "in", R.uniq(teamIds))).fetch(),
      Users.query(q => q.where(Fields.USR_ID, "in", R.uniq(userIds))).fetch(),
    ])
    return [projects, teams, users]
  }

  // async saveKeywordMappings (tx, keywordCollection, shared, owner) {
  //   const [projects, teams, users] = await this.getTargetMappings(shared)
  //   console.log("========== Saving Keyword to Target ===========")
  //   console.log("projects => ", projects.toJSON().map(p => p.proj_name))
  //   console.log("teams => ", teams.toJSON().map(t => t.team_name))
  //   console.log("users => ", users.toJSON().map(u => u.username))
  //   console.log("================================================")
  //   const mappingProjects = []
  //   const mappingTeams = []
  //   const mappingUsers = []
  //   const mappingOwner = []
  //   keywordCollection.forEach(kw => {
  //     const kmp = projects.map(p => KeywordMapping.forge({ proj_id: p.get(Fields.PROJ_ID) }))
  //     const kmt = teams.map(t => KeywordMapping.forge({ team_id: t.get(Fields.TEAM_ID) }))
  //     const kmu = users.map(u => KeywordMapping.forge({ usr_id: u.get(Fields.USR_ID) }))
  //     const kmo = [KeywordMapping.forge({ usr_id: owner.get(Fields.USR_ID), kwd_is_owner: true })]
  //     const setKeywordId = km => km.set(Fields.KWD_ID, kw.get(Fields.KWD_ID))
  //     mappingProjects.push(...kmp.map(setKeywordId))
  //     mappingTeams.push(...kmt.map(setKeywordId))
  //     mappingUsers.push(...kmu.map(setKeywordId))
  //     mappingOwner.push(...kmo.map(setKeywordId))
  //   })
  //   const combindMapping = R.reduce(R.concat, [], [mappingOwner, mappingUsers, mappingTeams, mappingProjects])
  //   const mappingCollection = KeywordMappings.forge(combindMapping)
  //   const savedKeywordMapping = await mappingCollection.invokeThen("save", null, {transacting: tx})
  //   return savedKeywordMapping
  // }

  convertToKeyword (data) {
    if (!data) return undefined
    const {
      id: kwd_id,
      name: kwd_name,
      content: kwd_content,
      desc: kwd_desc,
      doc: kwd_doc,
      deprecate: kwd_deprecate,
      review: kwd_review, // new
      isAprv: kwd_is_approved, // new
    } = data
    return Keyword.forge({ kwd_id, kwd_name, kwd_content, kwd_desc, kwd_doc, kwd_deprecate, kwd_review, kwd_is_approved })
  }

  validateCreateRequest (req) {
    req.check("keywords.*.name", "name is required").notEmpty()
    req.check("keywords.*.content", "content is required").notEmpty()
    req.check("keywords.*.desc", "desc is required").exists()
    req.check("keywords.*.doc", "doc is required").exists()
    req.check("keywords.*.deprecate", "deprecate is required").exists()
    req.check("keywords.*.shared", "shared is required").exists()
    req.check("keywords.*.shared.teamIds", "teamIds is required").exists()
    req.check("keywords.*.shared.projectIds", "projectIds is required").exists()
    req.check("keywords.*.shared.userIds", "userIds is required").exists()
    return req.validationErrors()
  }

  async edit (req, res) {
    try {
      req.check("name", "name is required").notEmpty()
      req.check("content", "content is required").notEmpty()
      req.check("desc", "desc is required").exists()
      req.check("doc", "doc is required").exists()
      req.check("deprecate", "deprecate is required").exists()
      const errors = req.validationErrors()
      if (errors) throw errors
      const { id } = req.params
      const keyword = this.convertToKeyword(req.body)
      const savedKeyword = await Keyword.update(keyword.toJSON(), { id })
      this.success(res, savedKeyword)
    } catch (error) {
      this.failure(res, error)
    }
  }

  async delete (req, res) {
    try {
      const { id: kwd_id } = req.params
      const getKeywordId = kw => kw.get(Fields.KWD_ID)
      const keyword = await Keyword.forge({ kwd_id }).fetch({ withRelated: ["childKeywords"] })
      if (!keyword) throw new Error("NotFound Keyword")

      const childKeywords = keyword.related("childKeywords")
      const data = await bookshelf.transaction(async (tx) => {
        const deletingKeywords = {
          keywordId: getKeywordId(keyword),
          childKeywordIds: childKeywords.map(getKeywordId),
        }
        childKeywords.length && await childKeywords.invokeThen("destroy", null, {transacting: tx})
        await keyword.destroy({ transacting: tx })
        return deletingKeywords
      })
      this.success(res, data)
    } catch (error) {
      this.failure(res, error)
    }
  }
}
