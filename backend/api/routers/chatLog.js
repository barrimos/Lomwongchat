const express = require('express')
const verifyToken = require('../../plugins/authToken/verifyToken')
const chatLogRouter = express.Router()

// get all chat log from that channel
chatLogRouter.get('/chatLog/ch', verifyToken, (req, res, next) => {

})

// get chat log between you and specific other at same channel
chatLogRouter.get('/chatLog/dm', verifyToken, (req, res, next) => {

})

// automatic save chat log every channel by time period
chatLogRouter.post('/chatLog/ch', verifyToken, (req, res, next) => {
  // time period
})

module.exports = chatLogRouter