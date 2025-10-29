import express from "express"
import fs from "fs"
import db from "../utils/db.js"

const router = express.Router()

router.get("/authorize", async(req, res) => {
  try {
    // 取出 req query 的資料
    // 檢查必要參數
    // 檢查 code_challenge_method === sha256
    // 驗證 client_id 和 redirect_uri
    // render login html
    // test URL: http://localhost:3000/authorize?response_type=code&client_id=6oYjcdxWWdRACTxSVxge9VK1G1UMvKuX&redirect_uri=http://localhost:5173&state=test123&code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM&code_challenge_method=S256&scope=openid%20profile%20email
    const {
      response_type,
      client_id,
      redirect_uri,
      scope = "openid profile email",
      state,
      code_challenge,
      code_challenge_method
    } = req.query
    
    if (!response_type || !client_id || !redirect_uri || !scope || !state || !code_challenge || !code_challenge_method) {
      return res.status(400).send("Missing required parameters")
    }

    if (response_type !== "code") {
      return res.status(400).send("Only code is supported")
    }

    if (code_challenge_method !== "S256") {
      return res.status(400).send("Only S256 is supported")
    }

    const client = db.prepare(`
      SELECT * FROM clients
      WHERE client_id = ? AND redirect_uri = ?  
    `).get(client_id, redirect_uri)

    if (!client) {
      return res.status(400).send("Invalid client or redirect_uri")
    }

    let html = fs.readFileSync("./views/login.html", "utf-8")

    html = html.replace('{{CLIENT_ID}}', client_id)
    html = html.replace('{{REDIRECT_URI}}', redirect_uri)
    html = html.replace('{{STATE}}', state)
    html = html.replace('{{CODE_CHALLENGE}}', code_challenge)
    html = html.replace('{{SCOPE}}', scope)

    res.send(html)

  } catch (error) {
    return res.status(500).json({
      error: "server_error",
      error_description: error.message
    })
  }
})

export default router