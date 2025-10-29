import Database from "better-sqlite3"
import bcrypt from "bcrypt"

// Connect DB
const db = new Database('./auth.sqlite')

console.log("Seeding database...")

const testUser = {
  email: "verna.chen@masterconcept.ai",
  password: "123456789",
  name: "Verna"
}
const passwordHash = bcrypt.hashSync(testUser.password, 10)

const existingUser = db.prepare("SELECT * FROM users WHERE email = ?").get(testUser.email)

if (!existingUser) {
  db.prepare(`
    INSERT INTO users (email, password_hash, name)
    VALUES (?, ?, ?)
  `).run(testUser.email, passwordHash, testUser.name)
  console.log(`Test user created: ${testUser.email} / ${testUser.password}`)
} else {
  console.log(`Test user already exists: ${testUser.email}`)
}

// 2nd_project client
const testClient = {
  client_id: "6oYjcdxWWdRACTxSVxge9VK1G1UMvKuX",
  client_name: "2nd_project",
  redirect_uri: "http://localhost:5173"
}

const existingClient = db.prepare("SELECT * FROM clients WHERE client_id = ?").get(testClient.client_id)

if (!existingClient) {
  db.prepare(`
    INSERT INTO clients (client_id, client_name, redirect_uri)
    VALUES (?, ?, ?)
  `).run(testClient.client_id, testClient.client_name, testClient.redirect_uri)
  console.log(`Test client created: ${testClient.client_id}`)
} else {
  console.log(`Test client already exists: ${testClient.client_id}`)
}

db.close()
console.log("Database seeding complete!")
