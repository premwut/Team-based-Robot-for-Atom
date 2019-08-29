import { Fields, RoleType } from "../utilities/constants"
import { getPagination, isPagination } from "../utilities/utils"

import BaseController from "./base.controller"
import Role from "../models/role.model"
import Team from "../models/team.model"
import User from "../models/user.model"
import { generateVerifyToken } from "../utilities/authentication"
import { getFeaturesByRole } from "../utilities/authorization"
import nodemailer from "nodemailer"

export default class UserController extends BaseController {
  async createUsers (req, res) {
    const errors = this.validateCreateRequest(req)
    if (errors) throw errors

    try {
      const { username, password, usr_fname, usr_lname, email, team_id = null, role_id = null } = req.body
      // check user data
      const isUserExist = await this.checkUserExist(username)
      if (isUserExist) throw new Error("User is exist.")

      // check password is empty (send mail to set password)
      let verify_token = null
      if (!password) {
        verify_token = generateVerifyToken(username, email)
        const isSuccess = await this.sendMailSetPassword(email, verify_token)
        if (!isSuccess) throw new Error("Can't send email")
      }

      // create user
      const data = { usr_fname, usr_lname, username, password, email, role_id, team_id, verify_token }
      let userCreated = await User.forge(data).save()
      userCreated = userCreated.toMinimal()

      const queryProcess = []
      role_id && queryProcess.push(Role.findById(role_id))
      team_id && queryProcess.push(Team.findById(team_id))
      if (queryProcess.length > 0) {
        const [role, team] = await Promise.all(queryProcess)
        userCreated.team = team.toJSON()
        userCreated.role = role.toJSON()
      }
      this.success(res, userCreated)
    } catch (error) {
      this.failure(res, error)
    }
  }

  async editUser (req, res) {
    try {
      req.check("usr_fname", "FirstName is required").notEmpty()
      req.check("usr_lname", "LastName is required").notEmpty()
      req.check("email", "email is required").notEmpty()
      const errors = req.validationErrors()
      if (errors) throw errors
      const { id } = req.params
      const { usr_fname, usr_lname, email, team_id, role_id } = req.body
      const data = { usr_fname, usr_lname, email, team_id, role_id }
      let userUpdated = await User.update(data, { id })
      userUpdated = userUpdated.toMinimal()

      const queryProcess = []
      role_id && queryProcess.push(Role.findById(role_id))
      team_id && queryProcess.push(Team.findById(team_id))
      if (queryProcess.length > 0) {
        const [role, team] = await Promise.all(queryProcess)
        userUpdated.team = team.toJSON()
        userUpdated.role = role.toJSON()
      }
      this.success(res, userUpdated)
    } catch (error) {
      this.failure(res, error)
    }
  }

  async editProfile (req, res) {
    try {
      req.check("usr_id", "User ID is required").notEmpty()
      req.check("usr_fname", "FirstName is required").notEmpty()
      req.check("usr_lname", "LastName is required").notEmpty()
      req.check("email", "email is required").notEmpty()
      const errors = req.validationErrors()
      if (errors) throw errors
      const { usr_id, usr_fname, usr_lname, email } = req.body
      const data = { usr_fname, usr_lname, email }
      let userUpdated = await User.update(data, { id: usr_id })
      userUpdated = userUpdated.toMinimal()
      this.success(res, userUpdated)
    } catch (error) {
      this.failure(res, error)
    }
  }

  async deleteUser (req, res) {
    try {
      const { id } = req.params
      await User.destroy({ id })
      this.success(res, { usr_id: parseInt(id) })
    } catch (error) {
      this.failure(res, error)
    }
  }

  async getProfile (req, res) {
    try {
      const data = req.currentUser.toMinimal()
      this.success(res, data)
    } catch (error) {
      this.failure(res, error)
    }
  }

  async getUserList (req, res) {
    try {
      const { page, limit: pageSize } = req.query
      let users
      if (isPagination(req)) {
        users = await User.forge().orderBy(Fields.USR_ID)
          .fetchPage({ page, pageSize, withRelated: ["team", "role"] })
      } else {
        users = await User.forge().orderBy(Fields.USR_ID).fetchAll()
      }
      this.success(res, { users, ...getPagination(users) })
    } catch (error) {
      this.failure(res, error)
    }
  }

  async getUserMembers (req, res) {
    try {
      const memberRole = await Role.findByName("TEAM_MEMBER")
      const roleId = memberRole.get(Fields.ROLE_ID)
      const query = q => q.where(Fields.ROLE_ID, roleId).orWhere(Fields.ROLE_ID, null)
      const users = await User.forge().query(query).orderBy(Fields.USR_ID).fetchAll()
      this.success(res, { users })
    } catch (error) {
      this.failure(res, error)
    }
  }

  async getUserShareable (req, res) {
    try {
      let users = []
      const { usr_id } = req.currentUser.toJSON()
      const allUser = await User.forge().orderBy(Fields.USR_ID).fetchAll()
      allUser.each(user => {
        const isAdmin = user.get(Fields.USERNAME).toUpperCase() === RoleType.ADMIN
        const isCurrentUser = user.get(Fields.USR_ID) === usr_id
        if (!isAdmin && !isCurrentUser) {
          users.push(user.toMinimal())
        }
      })
      this.success(res, { users })
    } catch (error) {
      this.failure(res, error)
    }
  }

  async getFeature (req, res) {
    try {
      const { role_id } = req.currentUser.toJSON()
      const { features } = await getFeaturesByRole(role_id)
      this.success(res, { features })
    } catch (error) {
      this.failure(res, error)
    }
  }

  async checkUserExist (username) {
    const matchUser = await User.findByUsername(username)
    return !!matchUser
  }

  validateCreateRequest (req) {
    req.check("username", "Username is required").notEmpty()
    // req.check("password", "Password is required").notEmpty()
    req.check("usr_fname", "FirstName is required").notEmpty()
    req.check("usr_lname", "LastName is required").notEmpty()
    req.check("email", "Email is required").notEmpty()
    return req.validationErrors()
  }

  sendMailSetPassword (email, verifyToken) {
    const verifyLink = `${process.env.WEB_DOMAIN}/reset-password?token=${verifyToken}`
    const auth = { user: process.env.MAIL_USER, pass: process.env.MAIL_PASSWORD }
    const transporter = nodemailer.createTransport({ service: "gmail", auth })
    const mailOptions = {
      from: process.env.MAIL_USER,
      to: [email],
      subject: "User created on Team-base Robot System",
      html: `
        <h1>User Created</h1>
        <p>Plase click <a href="${verifyLink}">here</a> to set your password</p>
      `,
    }

    return new Promise(resolve => {
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log("[Mail] send mail error ", err)
          resolve(false)
        } else {
          console.log("[Mail] send mail success")
          resolve(true)
        }
      })
    })
  }
}
