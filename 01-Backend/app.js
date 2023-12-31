const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const HttpError = require('./models/http-error')
const cors = require('cors')

const productRoutes = require('./routes/product-routes')
const categoryRoutes = require('./routes/category-routes')
const orderRoutes = require('./routes/order-routes')

const app = express()

app.use(bodyParser.json())
app.use(cors({origin: 'http://localhost:3000'}))

app.use('/product', productRoutes)
app.use('/category', categoryRoutes)
app.use('/order', orderRoutes)

app.use((error, req, res, next) => {
  if (res.headerSent) {
    return next(error)
  }
  res.status(error.code || 500)
  res.json({message: error.message || 'An unknown error occurred!'})
})

app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404)
  next(error)
})

mongoose.connect(`mongodb+srv://<user>:<password>@c<cluster>.mongodb.net/practica1?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(5000)
  })
  .catch(err => {
    console.log(err)
  })

