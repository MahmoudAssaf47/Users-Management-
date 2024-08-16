const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const bcrypt = require('bcrypt')
const session = require('express-session')
const bodyParser = require('body-parser')
const { body, validationResult } = require('express-validator')
require('dotenv').config()

const app = express()
const db = new sqlite3.Database('users.db') // Set the database file

app.use(bodyParser.urlencoded({ extended: false }))
app.use(express.static('public'))

app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using https
}))

// Create the database and tables if they do not exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  )`)
})

// User registration endpoint
app.post('/register', [
  body('email').isEmail(),
  body('password').isLength({ min: 8 })
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Invalid data' })
  }

  const { username, email, password } = req.body

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({ message: 'Encryption error' })
    }

    db.run(`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`, [username, email, hash], function (err) {
      if (err) {
        return res.status(500).json({ message: 'Data saving error' })
      }
      res.json({ message: 'Registration successful', userId: this.lastID })
    })
  })
})

// User data retrieval endpoint
app.post('/get-user', [
  body('email').isEmail(),
  body('password').isLength({ min: 8 })
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Invalid data' })
  }

  const { email, password } = req.body

  db.get('SELECT username, password FROM users WHERE email = ?', [email], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Data retrieval error' })
    }

    if (!row) {
      return res.status(404).json({ message: 'Email not found' })
    }

    bcrypt.compare(password, row.password, (err, result) => {
      if (err || !result) {
        return res.status(400).json({ message: 'Incorrect password' })
      }

      res.json({ username: row.username, email: email })
    })
  })
})

// User data update endpoint
app.post('/update-user', [
  body('email').isEmail(),
  body('oldPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 })
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Invalid data' })
  }

  const { email, oldPassword, newPassword, username } = req.body

  db.get('SELECT password FROM users WHERE email = ?', [email], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Data retrieval error' })
    }

    if (!row) {
      return res.status(404).json({ message: 'Email not found' })
    }

    bcrypt.compare(oldPassword, row.password, (err, result) => {
      if (err || !result) {
        return res.status(400).json({ message: 'Incorrect old password' })
      }

      bcrypt.hash(newPassword, 10, (err, hash) => {
        if (err) {
          return res.status(500).json({ message: 'Encryption error' })
        }

        db.run('UPDATE users SET username = ?, password = ? WHERE email = ?', [username, hash, email], function (err) {
          if (err) {
            return res.status(500).json({ message: 'Data update error' })
          }
          res.json({ message: 'Data updated successfully' })
        })
      })
    })
  })
})

// User deletion endpoint
app.post('/delete-user', [
  body('email').isEmail(),
  body('password').isLength({ min: 8 })
], (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Invalid data' })
  }

  const { email, password } = req.body

  db.get('SELECT password FROM users WHERE email = ?', [email], (err, row) => {
    if (err) {
      return res.status(500).json({ message: 'Data retrieval error' })
    }

    if (!row) {
      return res.status(404).json({ message: 'Email not found' })
    }

    bcrypt.compare(password, row.password, (err, result) => {
      if (err || !result) {
        return res.status(400).json({ message: 'Incorrect password' })
      }

      db.run('DELETE FROM users WHERE email = ?', [email], function (err) {
        if (err) {
          return res.status(500).json({ message: 'Data deletion error' })
        }

        res.json({ message: 'Data deleted successfully' })
      })
    })
  })
})

// Start the server
app.listen(3000, () => {
  console.log('Server is running on port 3000')
})
