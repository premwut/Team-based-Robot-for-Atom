import { basicAuthDecode, generateToken } from "../utilities/authentication"

import BaseController from "./base.controller"
import { Fields } from "../utilities/constants"
import User from "../models/user.model"

export default class UserController extends BaseController {
  async login (req, res) {
    try {
      req.assert("Authorization", "Authorization is required").notEmpty()
      const errors = req.validationErrors()
      if (errors) throw errors

      const { username, password } = basicAuthDecode(req)
      const currentUser = await User.findByUsername(username)
      const isValid = currentUser && await currentUser.comparePassword(password)
      if (currentUser && isValid) {
        const token = generateToken(currentUser)
        const data = { ...currentUser.toMinimal(), token }
        this.success(res, data)
      } else {
        this.badRequest(res, ["username or password invalid."])
      }
    } catch (error) {
      this.failure(res, error)
    }
  }

  async logout (req, res) {
    try {
      // TODO: implement logout api
      this.success(res, {})
    } catch (error) {
      this.failure(res, error)
    }
  }

  async changePassword (req, res) {
    try {
      req.check("password", "password is required").notEmpty()
      req.check("newPassword", "newPassword is required").notEmpty()
      req.check("reNewPassword", "reNewPassword is required").notEmpty()
      const errors = req.validationErrors()
      if (errors) throw errors

      const currentUser = req.currentUser
      const { password, newPassword, reNewPassword } = req.body
      const isValidPassword = await currentUser.comparePassword(password)
      if (newPassword !== reNewPassword) throw new Error("the new password mismatch")
      if (isValidPassword) {
        const user = await User.update({ password: newPassword }, { id: currentUser.get(Fields.USR_ID) })
        const token = generateToken(user)
        this.success(res, { ...user.toMinimal(), token })
      } else {
        throw new Error("invalid password")
      }
    } catch (error) {
      this.failure(res, error)
    }
  }
}
