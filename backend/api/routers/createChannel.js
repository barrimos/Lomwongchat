const express = require('express')

const ChannelModel = require('../models/channel.model')

const createChannelRouter = express.Router()

createChannelRouter.post('/:channelName', async (req, res, next) => {
  try {
    // find if exits
    const findOne = await ChannelModel.findOne({ room: { $eq: req.params.channelName } })

    const exitsRoom = findOne !== null

    if (!exitsRoom) {
      const data = new ChannelModel({ room: req.params.channelName })
      data.save()
        .then(() => res.status(201).json({ message: 'created completed' }))
        .catch(err => res.status(400).json({ message: 'craete incomplete', err }))
    } else {
      res.status(400).json({ error: 'Room already exists' })
    }
  } catch (err) {
    console.log(err)
  }


})

module.exports = createChannelRouter