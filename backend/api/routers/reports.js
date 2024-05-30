const express = require('express')
const reportModel = require('../models/reports.model')
const mongoose = require('mongoose')
const verifyToken = require('../../plugins/authToken/verifyToken')

const reportsRouter = express.Router()

reportsRouter.get('/:ticket?', verifyToken, async (req, res, next) => {
  const { ticket } = req.params

  try {
    if (ticket) {
      const oneReportData = await reportModel.findOne({ ticket: ticket, username: req.headers.username }, { _id: 0, __v: 0 })

      if (oneReportData) {
        res.status(200).json({ oneReportData })
      } else {
        res.status(200).json({ message: 'No ticket found' })
      }
    } else {
      const reportDatas = await reportModel.find({ $or: [{ reporter: req.headers.username }, { username: req.headers.username }] }, { _id: 0, __v: 0 })

      if (reportDatas) {
        res.status(200).json({ reportDatas })
      } else {
        res.status(200).json({ message: 'No ticket found' })
      }
    }
  } catch (err) {
    res.status(404).json({ error: err })
  }
})

reportsRouter.post('/', async (req, res, next) => {
  try {
    const data = req.body.data
    data.details = req.body.details

    data.timeMessage = new Date(Number(data.timeMessage))

    const report = new reportModel(data)
    await report.validate()

    report.save()
    res.status(201).json({ message: 'Report send', ticket: report.ticket })
  } catch (err) {
    // If ValidationError is thrown, it will be caught here
    if (err instanceof mongoose.Error.ValidationError) {
      // Handle validation errors
      res.status(400).json({ error: 'Validation error', details: err.errors });
    } else {
      // Handle other errors
      res.status(500).json({ error: 'Internal server error' });
    }
  }
})

module.exports = reportsRouter