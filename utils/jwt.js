import jwt from "jsonwebtoken"
import crypto from "crypto"
import dotenv from "dotenv"

import db from "./db.js"

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET

export function generateAccessToken(user, clientId) {
  return jwt.sign(
    {
      iss: "http://localhost:3000",
      sub: user.id.toString(),
      email: user.email,
      aud: clientId
    },
    JWT_SECRET,
    { expiresIn: "15m" }
  )
}

export function generateRefreshToken(user, clientId) {
  const token = crypto.randomBytes(64).toString('hex')
  const expiresAt = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)

  db.prepare(`
    INSERT INTO refresh_tokens (user_id, client_id, token, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(user.id, clientId, token, expiresAt)

  return token
}

function generateIdToken(user, clientId) {
  return jwt.sign(
    {
      iss: "http://localhost:3000",
      sub: user.id.toString(),
      name: user.name,
      email: user.email,
      aud: clientId
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  )
}

export function generateTokens(user, clientId) {
  const accessToken = generateAccessToken(user, clientId)
  const refreshToken = generateRefreshToken(user, clientId)
  const idToken = generateIdToken(user, clientId)

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    id_token: idToken,
    token_type: "Bearer",
    expires_in: 900
  }
}

export function verifyRefreshToken(token) {
  const refreshToken = db.prepare(`
    SELECT * FROM refresh_tokens
    WHERE token = ?
      AND revoked = 0
      AND expires_at > strftime('%s', 'now')
  `).get(token)

  return refreshToken
}

export function revokeRefreshToken(token) {
  db.prepare(`
    UPDATE refresh_tokens
    SET revoked = 1
    WHERE token = ?
  `).run(token)
}