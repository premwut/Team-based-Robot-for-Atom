import { getPagination, isPagination } from "../utilities/utils"

import BaseController from "./base.controller"
import { Fields } from "../utilities/constants"
import Project from "../models/project.model"
import R from "ramda"
import Team from "../models/team.model"
import User from "../models/user.model"

export default class TeamController extends BaseController {
  async getMember (req, res) {
    try {
      const { id: team_id } = req.params
      const team = await Team.forge({ team_id })
        .fetch({ withRelated: ["members"] }) || []
      this.success(res, team)
    } catch (error) {
      this.failure(res, error)
    }
  }

  async saveMember (req, res) {
    try {
      const { id } = req.params
      const { addMembers, removeMembers } = req.body
      req.check("addMembers", "addMembers fields is required").exists()
      req.check("removeMembers", "removeMembers fields is required").exists()
      const errors = req.validationErrors()
      if (errors) throw errors

      const team = await Team.findById(id)
      if (!team) throw new Error("team not found")

      const userIds = R.concat(addMembers, removeMembers)
      const isAddMembers = R.curry(u => R.contains(u.get(Fields.USR_ID), addMembers))
      const queryUsers = q => q.where(Fields.USR_ID, "in", userIds)
      const users = await User.collection().query(queryUsers).fetch()
      users.forEach(user => {
        user.set(Fields.TEAM_ID, isAddMembers(user) ? team.get(Fields.TEAM_ID) : null)
      })
      const usersUpdated = await Promise.all(users.invokeMap("save"))
      const data = usersUpdated.filter(u => isAddMembers(u)).map(u => u.toMinimal())
      this.success(res, data)
    } catch (error) {
      this.failure(res, error)
    }
  }

  async saveTeam (req, res) {
    try {
      const { id } = req.params
      const { addTeams, removeTeams } = req.body
      req.check("addTeams", "addTeams fields is required").exists()
      req.check("removeTeams", "removeTeams fields is required").exists()
      const errors = req.validationErrors(req)
      if (errors) throw errors

      const project = await Project.findById(id)
      if (!project) throw new Error("project not found")

      const teamIds = R.concat(addTeams, removeTeams)
      const isAddTeams = R.curry(t => R.contains(t.get(Fields.TEAM_ID), addTeams))
      const queryTeams = q => q.where(Fields.TEAM_ID, "in", teamIds)
      const teams = await Team.collection().query(queryTeams).fetch()
      teams.forEach(team => {
        team.set(Fields.PROJ_ID, isAddTeams(team) ? project.get(Fields.PROJ_ID) : null)
      })
      const teamsUpdated = await Promise.all(teams.invokeMap("save"))
      const data = teamsUpdated.filter(t => isAddTeams(t)).map(t => t.toJSON())
      this.success(res, data)
    } catch (error) {
      this.failure(res, error)
    }
  }

  async get (req, res) {
    try {
      const { id } = req.params
      const team = await Team.findById(id)
      this.success(res, team.toJSON())
    } catch (error) {
      this.failure(res, error)
    }
  }

  async getList (req, res) {
    try {
      const isPaging = isPagination(req)
      const { page, limit: pageSize } = req.query
      let teams
      if (isPaging) {
        teams = await Team.forge().orderBy(Fields.TEAM_ID)
          .fetchPage({ page, pageSize, withRelated: ["project"] })
      } else {
        teams = await Team.forge().orderBy(Fields.TEAM_ID).fetchAll()
      }
      // const teams = await (isPaging ? Team.forge().fetchPage({ page, pageSize }) : Team.forge().fetchAll())
      this.success(res, { teams, ...getPagination(teams) })
    } catch (error) {
      this.failure(res, error)
    }
  }

  async getShareable (req, res) {
    try {
      let teams = []
      const { team_id: currentTeamId } = req.currentUser.toJSON()
      const [allTeam, allProject] = await Promise.all([
        Team.forge().fetchAll(),
        Project.forge().fetchAll(),
      ])
      allTeam.each(team => {
        const { team_id, team_name, proj_id } = team.toJSON()
        const currentProject = allProject.get(proj_id).toJSON()
        delete currentProject.created_at
        delete currentProject.updated_at
        teams.push({
          team_id,
          team_name,
          isMyTeam: team.get(Fields.TEAM_ID) === currentTeamId,
          project: currentProject,
        })
      })
      this.success(res, { teams })
    } catch (error) {
      this.failure(res, error)
    }
  }

  async create (req, res) {
    try {
      const errors = this.validateCreateRequest(req)
      if (errors) throw errors
      const { team_name, proj_id = null } = req.body || {}
      const team = await Team.create({ team_name, proj_id })
      this.success(res, team.toJSON())
    } catch (error) {
      this.failure(res, error)
    }
  }

  async edit (req, res) {
    try {
      const errors = this.validateCreateRequest(req)
      if (errors) throw errors
      const { id } = req.params
      const { team_name, proj_id = null } = req.body || {}
      const team = await Team.update({ team_name, proj_id }, { id })
      this.success(res, team.toJSON())
    } catch (error) {
      this.failure(res, error)
    }
  }

  async delete (req, res) {
    try {
      const { id } = req.params
      await Team.destroy({ id })
      this.success(res, { team_id: parseInt(id) })
    } catch (error) {
      this.failure(res, error)
    }
  }

  validateCreateRequest (req) {
    req.check("team_name", "team_name is required").notEmpty()
    // req.check("projectId", "projectId is required").notEmpty()
    return req.validationErrors()
  }
}
