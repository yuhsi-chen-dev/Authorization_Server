import express from "express"
import fs from "fs"
import bcrypt from "bcrypt"
import db from "../utils/db.js"

const router = express.Router()

router.post("/login", async(req, res) => {
  try {
    // 取出 req body 資料
    // 檢查必要參數
    // 拿 email 找 user
    // 找到 user 比對密碼
    // 正確就是 authentication 通過 => render consent 進行 authorization
    const {
      email,
      password,
      client_id,
      redirect_uri,
      state,
      code_challenge,
      scope
    } = req.body

    if (!email || !password) {
      return res.status(400).send("Missing required parameters")
    }

    const user = db.prepare(`
      SELECT * FROM users
      WHERE email = ?
    `).get(email)

    if (!user) {
      return res.status(401).send("User not found")
    }

    const isPasswordValid = bcrypt.compareSync(password, user.password_hash)
    if (!isPasswordValid) {
      return res.status(401).send("Invalid password")
    }

    const client = db.prepare(`
      SELECT * FROM clients
      WHERE client_id = ?
    `).get(client_id)

    let html = fs.readFileSync("./views/consent.html", "utf-8")

    html = html.replace(/{{CLIENT_NAME}}/g, client.client_name)

    const scopeArray = scope.split(' ')
    const scopeListHTML = scopeArray
      .map(s => `<li class="list-group-item">${s}</li>`)
      .join('')

    html = html.replace('{{SCOPE_LIST}}', scopeListHTML)
    html = html.replace('{{CLIENT_ID}}', client_id)
    html = html.replace('{{REDIRECT_URI}}', redirect_uri)
    html = html.replace('{{STATE}}', state)
    html = html.replace('{{CODE_CHALLENGE}}', code_challenge)
    html = html.replace('{{SCOPE}}', scope)
    html = html.replace('{{USER_ID}}', user.id)

    res.send(html)
  } catch (error) {
    return res.status(500).json({
      error: "server_error",
      error_description: error.message
    })
  }
})

export default router
