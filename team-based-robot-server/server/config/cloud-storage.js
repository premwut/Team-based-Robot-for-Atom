import dotenv from "dotenv"

dotenv.load()
export const config = {
  keyFilename: process.env.KEY_FILE_PATH,
  projectId: process.env.PROJECT_ID,
  bucketName: process.env.BUCKET_NAME,
}
