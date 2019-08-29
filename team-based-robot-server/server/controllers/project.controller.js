import { getPagination, isPagination } from "../utilities/utils"

import BaseController from "./base.controller"
import { Fields } from "../utilities/constants"
import Project from "../models/project.model"
import Team from "../models/team.model"

export default class ProjectController extends BaseController {
  async getTeam (req, res) {
    try {
      const { id: proj_id } = req.params
      const project = await Project.forge({ proj_id }).fetch({ withRelated: ["teams"] })
      // const teams = project.related('teams')
      this.success(res, project)
    } catch (error) {
      this.failure(res, error)
    }
  }

  async get (req, res) {
    try {
      const { id } = req.params
      const project = await Project.findById(id)
      this.success(res, project.toJSON())
    } catch (error) {
      this.failure(res, error)
    }
  }

  async getList (req, res) {
    try {
      const isPaging = isPagination(req)
      const { page, limit: pageSize } = req.query
      const projects = await (isPaging ? Project.forge().fetchPage({ page, pageSize }) : Project.forge().fetchAll())
      this.success(res, { projects, ...getPagination(projects) })
    } catch (error) {
      this.failure(res, error)
    }
  }

  async getShareable (req, res) {
    try {
      let projects = []
      const { team_id } = req.currentUser.toJSON()
      const [team, allProject] = await Promise.all([
        Team.forge({ team_id }).fetch(),
        Project.forge().fetchAll(),
      ])
      allProject.each(project => {
        const data = project.toJSON()
        delete data.created_at
        delete data.updated_at
        projects.push({
          ...data,
          isMyProject: team.get(Fields.PROJ_ID) === data.proj_id,
        })
      })
      this.success(res, { projects })
    } catch (error) {
      this.failure(res, error)
    }
  }

  async create (req, res) {
    try {
      const errors = this.validateCreateRequest(req)
      if (errors) throw errors
      const { proj_name, proj_desc } = req.body
      const project = await Project.create({ proj_name, proj_desc })
      this.success(res, project.toJSON())
    } catch (error) {
      this.failure(res, error)
    }
  }

  async edit (req, res) {
    try {
      const errors = this.validateCreateRequest(req)
      if (errors) throw errors
      const { id } = req.params
      const { proj_name, proj_desc } = req.body
      const project = await Project.update({ proj_name, proj_desc }, { id })
      this.success(res, project.toJSON())
    } catch (error) {
      this.failure(res, error)
    }
  }

  async delete (req, res) {
    try {
      const { id } = req.params
      await Project.destroy({ id })
      this.success(res, { proj_id: parseInt(id) })
    } catch (error) {
      this.failure(res, error)
    }
  }

  validateCreateRequest (req) {
    req.check("proj_name", "proj_name is required").notEmpty()
    req.check("proj_desc", "proj_desc is required").notEmpty()
    return req.validationErrors()
  }
}
