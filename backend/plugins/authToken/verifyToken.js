const signToken = require('../signToken')
const userModel = require('../../api/models/user.model')

const jwt = require('jsonwebtoken')

require('dotenv').config()

const verifyToken = async (req, res, next) => {
  const userToken = req.cookies.accessToken
  const username = req.params.username ?? req.headers.username

  if (!userToken) {
    req.verified = { valid: false, error: 'Token is require' }
    return next()
  }

  try {
    const decoded = await jwt.verify(userToken, process.env.ACCESS_KEY)
    if (decoded.username !== username) {
      req.verified = { valid: false, error: 'Authenticate error' }
      return next()
    }

    // // check badge
    // if (decoded.role === 'banned') {
    //   req.verified = { valid: false, error: 'This username was banned' }
    //   return next()
    // }

    req.verified = { valid: true, username: decoded.username }
  } catch (err) {
    // in case token expired
    if (err.name === 'TokenExpiredError') {

      const ref = await userModel.findOne({ username: username }, { token: { accessToken: 1 }, _id: 0 })
      if (!ref) {
        req.verified = { valid: false, error: 'Authenticate error' }
        return next()
      }
      const [refHead, refPayload, refSign] = ref.token.accessToken.split('.')
      const refUsername = JSON.parse(atob(refPayload)).username
      const refKid = JSON.parse(atob(refHead)).kid

      const [currHead, currPayload] = userToken.split('.')
      const currKid = JSON.parse(atob(currHead)).kid
      const role = JSON.parse(atob(currPayload)).role

      if (currKid === refKid && username === refUsername) {
        const token = await signToken(username, role)
        if (token) {
          const success = await userModel.findOneAndUpdate({ username: username }, { $set: { token: token } }, { new: true })
          if (success) {
            req.verified = { valid: true }
            res.cookie('accessToken', token.accessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 1000 * 60 * 60 * 24 * 1 })
          } else {
            req.verified = { valid: false, error: 'Something went wrong' }
          }
          return next()
        }
      }

      req.verified = { valid: false, error: 'Reauthenticate error' }
    } else {
      req.verified = { valid: false, error: err.name.toString() }
    }
  }
  next()
}

module.exports = verifyToken