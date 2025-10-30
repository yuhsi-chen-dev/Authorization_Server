import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import session from "express-session"

import routes from './routes/index.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({
  origin: "http://localhost:5173",
  methods: ["GET", "POST"],
  credentials: true
}))

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,
  }
}))

app.set("view engine", "pug")
app.set("views", "./views")
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(routes)

app.listen(PORT, () => {
  console.log(`Authorization Server running on http://localhost:${PORT}`)
})
