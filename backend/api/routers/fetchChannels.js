const express = require('express')
const ChannelModel = require('../models/channel.model')

const fetchChannelsRouter = express.Router()

fetchChannelsRouter.get('/', async (req, res, next) => {
  try {
    const channels = await (await ChannelModel.find({}, { room: 1, _id: 0 })).map(channel => channel.room)

    res.status(200).json(channels)
  } catch (err) {
    res.status(400).json({ error: err })
  }
})

module.exports = fetchChannelsRouter