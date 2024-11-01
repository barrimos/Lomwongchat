const express = require('express')
const userModel = require('../models/user.model')

const logoutRouter = express.Router()

logoutRouter.post('/', async (req, res, next) => {
  await userModel.findOneAndUpdate({ username: req.body.username }, { $set: { lastActive: new Date(Date.now()).toISOString() } }, { new: true })
    .then(() => {
      res.clearCookie('accessToken')
      res.status(201).end()
    })
    .catch(err => {
      res.status(400).end()
    })
})

module.exports = logoutRouter