const mongoose = require('mongoose')
const server = require('./api/index')
const config = require('./config')


const boot = async () => {
  await mongoose.connect('mongodb://localhost:27017/lomwongchat')
  // await mongoose.connect(config.mongoUri, config.mongoOptions)
  server.listen(config.port, () => {
    console.log(`server listening on ${config.port}`)
  })
}

boot()