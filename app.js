const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const PORT = process.env.PORT || 3000

// Variables d'environnement
require('dotenv/config')

// Middlewares
app.use(bodyParser.json())

// Routes
const userRoute = require('./routes/user')
app.use('/user', userRoute)

const authRoute = require('./routes/auth')
app.use('/api/user', authRoute)

// Connection to MongoDb
mongoose.connect(
  'mongodb+srv://' + process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@' + process.env.DB_HOST + '/femi',
  {
    useUnifiedTopology: true,
    useNewUrlParser: true
  },
  (err) => {
    if (err == null) {
      console.log('Connected to database !')
    } else {
      console.log('Connection failed')
    }
  }
)

// Begin listen
app.listen(PORT, () => {
  console.log('Listening on port ' + PORT)
})
