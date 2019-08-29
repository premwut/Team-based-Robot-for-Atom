import User from "../models/user.model"
import jwt from "jsonwebtoken"
import moment from "moment"

export const generateToken = (user) => {
  const { usr_id: uid, role_id: rid } = user.toJSON()
  const payload = {
    iss: "team-based-robot.herokuapp.com",
    iat: moment().unix(),
    exp: moment().add(1, "days").unix(),
    sub: { uid, rid },
  }
  return jwt.sign(payload, process.env.TOKEN_SECRET)
}

export const generateVerifyToken = (username, email) => {
  const payload = {
    iss: "team-based-robot.herokuapp.com",
    iat: moment().unix(),
    exp: moment().add(3, "days").unix(),
    sub: { username, email },
  }
  return jwt.sign(payload, process.env.TOKEN_SECRET)
}

export const basicAuthDecode = (req) => {
  const { authorization } = req.headers
  const base64encrypt = authorization && authorization.split(" ")[1]
  const base64decrypt = Buffer.from(base64encrypt, "base64")
  const [username, password] = base64decrypt.toString().split(":")
  return { username, password }
}

export const verifyAuthentication = async (req, res, next) => {
  try {
    let { authorization: token } = req.headers
    if (!token) {
      return res.status(401).json({ error: "Unauthorized" })
    }

    const { sub, ...rest } = verifyToken(token)
    const currentUser = sub ? await User.findById(sub.uid) : undefined
    if (rest && currentUser) {
      req.currentUser = currentUser // assign user model to request
      next()
    } else {
      throw new Error("verify token failure.")
    }
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.TOKEN_SECRET)
  } catch (error) {
    return false
  }
}
