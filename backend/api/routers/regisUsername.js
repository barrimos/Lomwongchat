const express = require('express')
const userModel = require('../models/user.model')
const signToken = require('../../plugins/signToken')
const bcrypt = require('bcrypt')

const regisRouter = express.Router()
const blockWords = new RegExp(/\badmin\b|\badministrator\b|\bmoderator\b/g);

regisRouter.post('/', async (req, res, next) => {
  const data = {
    username: '',
    password: '',
    role: '',
    token: {
      accessToken: '',
      refreshToken: ''
    }
  }

  const { username, password } = req.body

  try {
    const isAvailableName = blockWords.test(username)
    if (isAvailableName) {
      blockWords.lastIndex = 0;
      return res.status(401).json({ error: 'You can\'t use this username' })
    }

    const hashPass = await bcrypt.hash(password, 5)
    data.username = username
    data.password = hashPass
    data.role = '301'
    data.status = 'normal'
    const token = await signToken(data.username, data.role)
    if (token) {
      data.token = token
    } else {
      data.username = ''
      data.password = ''
      return res.status(400).json({ error: 'Registration not complete' })
    }
    const user = new userModel(data)
    user.save()
    res.status(201).json({ user: username })
  } catch (err) {
    res.status(400).json({ error: err })
  }
})

module.exports = regisRouter