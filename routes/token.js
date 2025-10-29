import express from "express"
import db from "../utils/db.js"
import { verifyPKCE } from "../utils/pkce.js"
import { generateTokens } from "../utils/jwt.js"

const router = express.Router()

router.post("/token", async (req, res) => {
  try {
    // 取出 req body 參數
    // 檢查 code 是不是存在資料表 authorization_code 中(是否使用、過期)
    // 檢查 client_id 是不是存在資料表中
    // 檢查 redirect_uri 是不是在資料表中有註冊過了
    // 驗證 code_verifier 與資料表中的 code_challenge 是否一致
    // 拿用戶資料做token
    const { client_id, code, code_verifier, redirect_uri } = req.body

    const authCode = db.prepare(`
      SELECT * FROM authorization_codes
      WHERE code = ? AND client_id = ?  
    `).get(code, client_id)
    
    if (!authCode) {
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "Invalid authorization code"
      })
    }

    if (authCode.used === 1) {
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "Authorization code already used"
      })
    }

    const now = new Date().toISOString()
    if (authCode.expires_at < now) {
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "Authorization code expired"
      })
    }

    if (authCode.redirect_uri !== redirect_uri) {
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "Redirect URI mismatch"
      })
    }

    const isPKCEValid = verifyPKCE(code_verifier, authCode.code_challenge)
    if (!isPKCEValid) {
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "PKCE verification failed"
      })
    }

    const user = db.prepare(`
      SELECT * FROM users WHERE id = ?
    `).get(authCode.user_id)
    
    if (!user) {
      return res.status(400).json({
        error: "invalid_grant",
        error_description: "User not found"
      })
    }

    const tokens = generateTokens(
      {
        id: user.id,
        email: user.email,
        name: user.name
      },
      client_id
    )

    db.prepare(`
      UPDATE authorization_codes
      SET used = 1
      WHERE code = ?
    `).run(code)
    
    return res.status(200).json(tokens)

  } catch (error) {
    res.status(500).json({
      error: "server_error",
      error_description: error.message
    })
  }
})

export default router
