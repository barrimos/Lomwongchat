const express = require('express')
const verifyToken = require('../../plugins/authToken/verifyToken')
const userModel = require('../models/user.model')
const isMatch = require('../../plugins/isMatch')

const authRouter = express.Router()

const checkStatus = async (req, res, next) => {
  const user = await userModel.findOne({ username: req.params.username }, { _id: 0, status: 1, token: { accessToken: 1 } })
  if (user.status === 'banned') {
    req.verified = { valid: false, error: 'You was banned' }
  } else {
    req.verified = { valid: true, token: user.token.accessToken }
  }

  next()
}

authRouter.get('/login/:username/:password', [isMatch, checkStatus], async (req, res, next) => {
  if (req.verified.valid) {
    await userModel.findOneAndUpdate({ username: req.params.username }, { $set: { lastActive: new Date(Date.now()).toISOString() } }, { new: true })
    res.cookie('accessToken', req.verified.token, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 1000 * 60 * 60 * 24 * 1 })
    res.status(200).json({ valid: req.verified.valid })
  } else {
    res.status(401).json({ valid: req.verified.valid, error: req.verified.error })
  }
})

authRouter.get('/token/:username', verifyToken, async (req, res, next) => {
  if (req.verified.valid) {
    res.status(200).json({ valid: req.verified.valid, username: req.verified.username })
  } else {
    res.status(200).json({ valid: req.verified.valid, error: req.verified.error })
  }
})

module.exports = authRouter