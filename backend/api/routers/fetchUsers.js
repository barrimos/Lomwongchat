const express = require('express')
const userModel = require('../models/user.model')

const fetchUsersRouter = express.Router()

fetchUsersRouter.get('/', async (req, res, next) => {
  try {
    // for only fetch username
    const allUsers = await userModel.find({ username: { $nin: ['admin', 'administrator', 'morderator'] } }, { username: 1 })
    const values = allUsers.map(item => item.username);
    res.status(200).json(values)
  } catch (err) {
    res.status(400).json({ error: err })
  }
})


module.exports = fetchUsersRouter