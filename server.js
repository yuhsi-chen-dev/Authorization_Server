import express from "express"
import dotenv from "dotenv"

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.get("/", (req, res) => {
  res.json({ status: "OK" })
})


app.listen(PORT, () => {
  console.log(`Authorization Server running on http://localhost:${PORT}`)
})
