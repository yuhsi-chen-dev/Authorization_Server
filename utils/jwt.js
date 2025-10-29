import jwt from "jsonwebtoken"
import dotenv from "dotenv"

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET

export function generateTokens(user, clientId) {
  const accessToken = jwt.sign(
    {
      iss: "http://localhost:3000",
      sub: user.id.toString(),
      email: user.email,
      aud: clientId
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  )

  const idToken = jwt.sign(
    {
      iss: "http://localhost:3000",
      sub: user.id.toString(),
      email: user.email,
      name: user.name,
      aud: clientId
    },
    JWT_SECRET,
    { expiresIn: "1h" }
  )

  return {
    access_token: accessToken,
    id_token: idToken,
    token_type: "Bearer",
    expires_in: 3600
  }
}


export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    throw new Error("Invalid token")
  }
}