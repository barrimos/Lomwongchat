const nodeCrypto = require('node:crypto')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const signToken = async (username, role) => {
  const kid = await nodeCrypto.randomBytes(4).toString('hex');

  try {
    const accessToken = await jwt.sign({ username: username, tokenType: 'access', role: role }, process.env.ACCESS_KEY, { header: { kid: kid }, expiresIn: '10m' })
    const refreshToken = await jwt.sign({ username: username, tokenType: 'refresh', role: role }, process.env.REFRESH_KEY, { header: { kid: kid }, expiresIn: '1d' })

    return { accessToken: accessToken, refreshToken: refreshToken }
  } catch (err) {
    return
  }
}

module.exports = signToken