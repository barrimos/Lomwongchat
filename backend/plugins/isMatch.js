const userModel = require('../api/models/user.model')

const bcrypt = require('bcrypt')

const isMatch = async (req, res, next) => {
  const { username, password } = req.params
  if (!username || !password) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // get user's data from database
  const data = await userModel.findOne({ username: req.params.username }, { password: 1, _id: 0 })
  if (data) {
    const isMatch = await bcrypt.compareSync(password, data?.password)
    if (isMatch) {
      next()
    } else {
      return res.status(401).json({ valid: false, error: 'Username or Password is incorrect' })
    }
  }
  
}

module.exports = isMatch