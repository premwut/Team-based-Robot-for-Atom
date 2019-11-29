import DbErrorCodes from "postgres-response-codes"
export default class BaseController {
  success (res, data) {
    return res.status(200).json({ data })
  }
  badRequest (res, data) {
    console.error(`[BadRequest] => ${data}`)
    return res.status(400).json({ error: data })
  }

  failure (res, error) {
    if (error instanceof Error) {
      const dbError = DbErrorCodes[error.code]
      dbError && (error.message = dbError)
      console.error(`[Error] (${error.code}) => ${error.message}`)
      console.log(error)
      return res.status(500).json({ error: error.message })
    } else {
      console.error(`[Error] => ${error}`)
      return res.status(500).json({ error })
    }
  }
}
