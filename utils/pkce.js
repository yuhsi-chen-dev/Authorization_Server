import crypto from "crypto"

export function verifyPKCE(codeVerifier, codeChallenge) {
  const hash = crypto.createHash('sha256').update(codeVerifier).digest()

  const calculatedChallenge = hash
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')

  return calculatedChallenge === codeChallenge
}