import express from "express"
import bcrypt from "bcrypt"
import db from "../utils/db.js"
import { renderConsent } from "../utils/consent.js"

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

    if (!email || !password || !client_id || !redirect_uri || !state || !code_challenge || !scope) {
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

    // save session
    req.session.user = {
      id: user.id,
      email: user.email
    }

    const client = db.prepare(`
      SELECT * FROM clients
      WHERE client_id = ?
    `).get(client_id)

    if (!client) {
      return res.status(400).send("Invalid client or redirect_uri")
    }
    
    renderConsent(req, res, {
      client,
      redirect_uri,
      state,
      code_challenge,
      scope
    })
  } catch (error) {
    return res.status(500).json({
      error: "server_error",
      error_description: error.message
    })
  }
})

export default router
