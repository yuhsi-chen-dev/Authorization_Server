import express from "express"
import db from "../utils/db.js"

const router = express.Router()

router.get("/v2/logout", (req, res) => {
  try {
    const { client_id, returnTo } = req.query

    const client = db.prepare(`
      SELECT * FROM clients WHERE client_id = ?
    `).get(client_id)

    if (!client) {
      return res.status(400).send("Invalid client")
    }

    if (req.session.user) {
      db.prepare(`
        UPDATE refresh_tokens
        SET revoked = 1
        WHERE user_id = ?  
      `).run(req.session.user.id)
    }

    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send("Logout failed")
      }
      res.redirect(returnTo)
    })
  } catch (error) {
    return res.status(500).json({
      error: "server_error",
      error_description: error.message
    })
  }
})

export default router