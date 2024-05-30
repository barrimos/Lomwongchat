const mongoose = require('mongoose')
const Schema = mongoose.Schema

const channelSchema = new Schema({
  room: {
    type: String,
    required: true
  },
  chatLog: {
    type: Object,
    default: []
  }
})

const ChannelModel = mongoose.model('channels', channelSchema, 'channels')

module.exports = ChannelModel