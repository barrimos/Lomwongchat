const express = require('express')
const http = require('node:http')
const mongoose = require('mongoose')
const fetchUsers = require('./routers/fetchUsers')
const aso = require('./routers/aso')
const regisUsername = require('./routers/regisUsername')
const createChannel = require('./routers/createChannel')
const fetchChannels = require('./routers/fetchChannels')
const auth = require('./routers/auth')
const reports = require('./routers/reports')
const chatLog = require('./routers/chatLog')
const logout = require('./routers/logout')

const socket_io = require('socket.io')
const cookieParser = require('cookie-parser')
const cors = require('cors')
const config = require('../config')

const clientsConnected = {}
const adminConnected = {}
const loginName = {}
const channels = {
  lobby: {
    count: 0,
    users: []
  }
}
const usersJoined = ['']

const options = {
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true
}

const app = express()
const server = http.createServer(app)
const io = socket_io(server, {
  cors: options
})

app.use(cors(options))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/regisUsers', regisUsername)
app.use('/users', fetchUsers)
app.use('/adsysop', aso)
app.use('/auth', auth)
app.use('/reports', reports)
app.use('/logout', logout)
app.use('/channels', fetchChannels)
app.use('/createChannel', createChannel)
app.use('/chatLog', chatLog)

app.use('*', (req, res, next) => {
  res.status(404).json({ error: 'You Lost' })
})

io.on('connection', socket => {
  console.log(`${socket.id} connected`)

  socket.on('verify', username => {
    if (username === 'admin') {
      adminConnected[username] = socket.id
    } else {
      clientsConnected[username] = socket.id
    }
    loginName[socket.id] = username

    socket.emit('getId', socket.id)
    io.emit('usersOnline', Object.keys(clientsConnected)) // send to client

    // initial join
    socket.join('lobby')
  })

  socket.on('joinChannel', data => {
    if (!channels[data[1]] && data[1]) {
      channels[data[1]] = { count: 0, users: [] }
    }

    if (data[0]) {
      channels[data[0]].count--
      channels[data[0]].users.splice(channels[data[0]].users.indexOf(data[2]), 1)
      socket.leave(data[0])
    }
    if (data[1]) {
      channels[data[1]].count++
      channels[data[1]].users.push(data[2])
      socket.join(data[1])
      socket.to(adminConnected['admin']).emit('usersJoinedChannel', data)
      usersJoined[1] = data[1]
      usersJoined[2] = data[2]
    }
  })
  socket.on('toD', () => {
    if (usersJoined[1] && usersJoined[2]) socket.emit('usersJoinedChannel', usersJoined)
  })

  socket.on('message', ({ rid, username, message, rawTime, timestamp, reply }) => {
    const data = {
      username: username,
      message: message,
      rawTime: rawTime,
      timestamp: timestamp,
      reply: reply
    }

    // save to 

    io.to(rid ?? 'lobby').emit('broadcast', data)
  })

  socket.on('newChannelCreated', newChannelName => {
    channels[newChannelName] = { count: 0, users: [] }
    io.emit('fetchNewChannel')
  })

  socket.on('logout', (username, skid, channel) => {
    channels[channel].users.splice(channels[channel].users.indexOf(loginName[skid]), 1)
    channels[channel].count--
    if (username !== 'admin') {
      socket.to(adminConnected['admin']).emit('usersJoinedChannel', usersJoined, true)
    }
    usersJoined[1] = ''
    usersJoined[2] = ''
    delete adminConnected[username]
    delete clientsConnected[username]
    delete loginName[skid]

    io.emit('usersOnline', Object.keys(clientsConnected))
  })

  socket.on('beforeUnload', (skid, channel) => {
    channels[channel].users.splice(channels[channel].users.indexOf(loginName[skid]), 1)
    if (channels[channel].count > 0) channels[channel].count--
    if (loginName[skid] === 'admin') {
      delete adminConnected[loginName[skid]]
    } else {
      delete clientsConnected[loginName[skid]]
    }
    delete loginName[skid]
  })

  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnect`)
  })
})

module.exports = server