const express = require('express')
const rateLimiter = require('../../plugins/rateLimit')
const userModel = require('../models/user.model')
const verifyToken = require('../../plugins/authToken/verifyToken')
const reportModel = require('../models/reports.model')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
let attempRemains = 3
let isAdminLogin = false

const administratorSystemOperation = express.Router()

const checkPayload = async (username, token) => {
  const payload = JSON.parse(atob(token.split('.')[1]))
  const badge = await mongoose.connection.collection('badge').findOne({}, { projection: { _id: 0, [payload.role]: 1 } })
  if (payload.role !== '100' || badge[payload.role] !== payload.username || username !== payload.username) {
    return false
  } else {
    return true
  }
}

const verifyRole = async (req, res, next) => {
  const token = req.cookies.accessToken
  const username = req.params.username ?? req.body.admin

  if (!token) {
    return res.status(401).json({ valid: false, error: 'Token is require' })
  }

  checkPayload(username, token)
    .then(isVerify => {
      if (!isVerify) return res.status(401).json({ valid: false, error: 'No permission' })
    })
    .catch(err => {
      return res.status(401).json({ valid: false, error: 'No permission' })
    })
  next()
}

administratorSystemOperation.post('/', rateLimiter, async (req, res, next) => {
  if (isAdminLogin) {
    res.status(400).json({ valid: false, error: 'Something went wrong. Contact developer' })
    return
  }

  const { username, password } = req.body
  const user = await userModel.findOne({ username: username }, { password: 1, token: { accessToken: 1 }, _id: 0 })
  if (!user) {
    attempRemains--
    res.status(401).json({ valid: false, error: 'Unauthorized' })
    return
  }

  const isMatch = await bcrypt.compareSync(password, user?.password)

  if (isMatch) {
    const response = await userModel.findOne({ username: username }, { token: { accessToken: 1 }, _id: 0 })

    checkPayload(username, response.token.accessToken)
      .then(isVerify => {
        if (!isVerify) {
          attempRemains--
          res.status(401).json({ valid: false, error: 'No permission', attempRemains: attempRemains })
        } else {
          res.cookie('accessToken', response?.token.accessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 1000 * 60 * 10 })

          isAdminLogin = true
          res.status(200).json({ valid: true, username: username })
        }
      })
      .catch(err => {
        res.status(401).json({ valid: false, error: err })
      })
  } else {
    attempRemains--
    res.status(401).json({ valid: false, error: 'Unauthorized', attempRemains: attempRemains })
  }
})

administratorSystemOperation.get('/verify/:username', [verifyRole, verifyToken], (req, res, next) => {
  if (req.verified.valid) {
    // check role
    res.status(200).json({ valid: true })
  } else {
    res.status(401).json({ valid: false })
  }
})

administratorSystemOperation.get('/data/:username', [verifyRole, verifyToken], async (req, res, next) => {
  if (req.verified.valid) {
    const response = await userModel.find({ username: { $nin: ['admin', 'administator', 'moderator'] } }, { password: 0, _id: 0 })
    const reports = await reportModel.find({}, { _id: 0 })
    attempRemains = 3
    rateLimiter.resetKey(req.ip)
    res.status(200).json({ valid: true, response: response, reports: reports })
  } else {
    res.status(401).json({ valid: false, error: req.verified.error })
  }
})

administratorSystemOperation.delete('/', (req, res, next) => {
  res.clearCookie('accessToken')
  isAdminLogin = false
  res.status(200).end()
})

administratorSystemOperation.get('/remains', (req, res, next) => {
  res.status(200).json(attempRemains)
})

administratorSystemOperation.post('/updateStatus', verifyRole, async (req, res, next) => {
  const success = await userModel.findOneAndUpdate({ username: req.body.user.username }, { $set: { status: req.body.statusName } }, { new: true })
  if (success) {
    res.status(201).end()
  } else {
    res.status(400).end()
  }
})

administratorSystemOperation.get('/reports/:username', [verifyRole, verifyToken], async (req, res, next) => {
  if (req.verified.valid) {
    const data = await reportModel.find({}, { _id: 0 })
    res.status(201).json({ reports: data })
  } else {
    res.status(401).json({ error: req.verified.error })
  }
})

administratorSystemOperation.post('/reports/:username/:ticket/:status', [verifyRole, verifyToken], async (req, res, next) => {
  const { ticket, status } = req.params
  if (!ticket || !status) {
    res.status(404).json({ error: 'Ticket or Status is require' })
  } else {
    if (req.verified.valid) {
      const successUpdated = await reportModel.findOneAndUpdate({ ticket: ticket }, { $set: { status: status } }, { $new: true })
      if (successUpdated) {
        res.status(201).json({ reports: successUpdated })
      } else {
        res.status(200).json({ error: 'Processing error' })
      }
    } else {
      res.status(401).json({ error: req.verified.error })
    }
  }
})

administratorSystemOperation.delete('/reports/:username/:ticket/:status', [verifyRole, verifyToken], async (req, res, next) => {
  const { ticket, status } = req.params
  if (!ticket || !status) {
    res.status(404).json({ error: 'Ticket or Status is require' })
  } else {
    if (req.verified.valid) {
      const successUpdated = await reportModel.findOneAndDelete({ ticket: ticket })
      if (successUpdated) {
        res.status(201).json({ reports: successUpdated })
      } else {
        res.status(200).json({ error: 'Processing error' })
      }
    } else {
      res.status(401).json({ error: req.verified.error })
    }
  }
})

module.exports = administratorSystemOperation