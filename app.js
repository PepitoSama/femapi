const express = require('express')
var cors = require('cors')
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')

const PORT = process.env.PORT || 3000

// Variables d'environnement
require('dotenv/config')

// Middlewares
app.use(cors())
app.use(bodyParser.json())

// Routes
const userRoute = require('./routes/user')
const authRoute = require('./routes/auth')
const remarkRoute = require('./routes/remark')

// Routes Middleware
app.use('/user', userRoute)
app.use('/api/user', authRoute)
app.use('/api/remark', remarkRoute)

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
