import base64 from "base-64"
import moment from "moment"

export default function ({ store, redirect }) {
  const token = store.$cookies.cookies["auth.token"]
  if (!token) {
    // Notfound Token
    return redirect("/login")
  } else {
    // Validate Token Expired
    const { exp: expireTime } = JSON.parse(base64.decode(token.split(".")[1]))
    const currentTime = moment().unix()
    if (currentTime >= expireTime) {
      return redirect("/login")
    }
  }
}
