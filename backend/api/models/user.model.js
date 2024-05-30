const mongoose = require('mongoose')
const Schema = mongoose.Schema

const usersSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true
  },
  token: {
    type: Object,
    required: true,
    accessToken: {
      type: String,
      required: true
    },
    refreshToken: {
      type: String,
      required: true
    }
  },
  lastActive: {
    type: String
  },
  status: {
    type: String
  }
}, {
  timestamps: true
})

const userModel = mongoose.model('users', usersSchema, 'users')

module.exports = userModel