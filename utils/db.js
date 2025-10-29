import Database from "better-sqlite3"
import dotenv from "dotenv"
import fs from "fs"

dotenv.config()

const DB_PATH = process.env.DB_PATH

if (!fs.existsSync(DB_PATH)) {
  console.error("Database file not found!")
  console.error("Please run the following commands: ")
  console.error("1. npm run db:init")
  console.error("2. npm run db:seed")
  process.exit(1)
}

const db = new Database(DB_PATH)

db.pragma("foreign_keys = ON")

export default db