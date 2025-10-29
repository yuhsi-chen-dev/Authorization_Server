import express from "express"
import crypto from "crypto"
import db from "../utils/db.js"

const router = express.Router()

router.post("/consent", (req, res) => {
  try {
    // 取出 form 送過來的參數資料
    // 檢查是 allow or deny
    // 生成 authorization code 作為中間憑證搭配 state 導回 redirect_uri?code=xxx&state=xxx
    // 要將資料存進 authorization_codes table
    const {
      action,
      client_id,
      redirect_uri,
      state,
      code_challenge,
      scope,
      user_id
    } = req.body

    if (action === "deny") {
      return res.redirect(`${redirect_uri}?error=access_denied&state=${state}`)
    }

    const code = crypto.randomBytes(32).toString("hex")
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

    db.prepare(`
      INSERT INTO authorization_codes
      (code, user_id, client_id, redirect_uri, code_challenge, scope, expires_at, used)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0)
    `).run(code, user_id, client_id, redirect_uri, code_challenge, scope, expiresAt)

    res.redirect(`${redirect_uri}?code=${code}&state=${state}`)
    
  } catch (error) {
    return res.status(500).json({
      error: "server_error",
      error_description: error.message
    })
  }
})

export default router