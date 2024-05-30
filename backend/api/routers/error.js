const express = require('express')

const errorRouter = express.Router()

errorRouter.get('/', (req, res, next) => {
  res.status(404).json({ error: 'You Lost' })
})

module.exports = errorRouter