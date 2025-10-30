import express from "express"
import db from "../utils/db.js"
import { verifyPKCE } from "../utils/pkce.js"
import {
  generateTokens,
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
} from "../utils/jwt.js"

const router = express.Router()

const handleAuthorizationCodeGrant = async (req, res) => {
  const { code, code_verifier, redirect_uri, client_id } = req.body

  if (!code || !code_verifier || !redirect_uri || !client_id) {
    return res.status(400).json({
      error: "invalid_request",
      error_description: "Missing required parameters"
    })
  }

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
}

const handleRefreshTokenGrant = async (req, res) => {
  const { refresh_token, client_id } = req.body

  if (!refresh_token || !client_id) {
    return res.status(400).json({
      error: "invalid_request",
      error_description: "Missing required parameters"
    })
  }

  const validRefreshToken = verifyRefreshToken(refresh_token)

  if (!validRefreshToken) {
    return res.status(401).json({
      error: "invalid_grant",
      error_description: "Invalid or expired refresh token"
    })
  }

  if (validRefreshToken.client_id !== client_id) {
    return res.status(401).json({
      error: "invalid_grant",
      error_description: "Client ID mismatch"
    })
  }

  const user = db.prepare(`
    SELECT * FROM users WHERE id = ?
  `).get(validRefreshToken.user_id)

  if (!user) {
    return res.status(404).json({
      error: "invalid_grant",
      error_description: "User not found"
    })
  }

  const newAccessToken = generateAccessToken(
    {
      id: user.id,
      email: user.email,
      name: user.name
    },
    client_id
  )

  const newRefreshToken = generateRefreshToken(
    {
      id: user.id,
      email: user.email,
      name: user.name
    },
    client_id
  )

  revokeRefreshToken(refresh_token)

  return res.status(200).json({
    access_token: newAccessToken,
    refresh_token: newRefreshToken,
    token_type: "Bearer",
    expires_in: 900
  })
}

router.post("/token", async (req, res) => {
  try {
    const { grant_type } = req.body

    switch (grant_type) {
      case "authorization_code":
        return await handleAuthorizationCodeGrant(req, res)

      case "refresh_token":
        return await handleRefreshTokenGrant(req, res)

      default:
        return res.status(400).json({
          error: "unsupported_grant_type",
          error_description: `Grant type '${grant_type}' is not supported`
        })
    }

  } catch (error) {
    res.status(500).json({
      error: "server_error",
      error_description: error.message
    })
  }
})

export default router
