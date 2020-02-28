const express = require("express");
const app     = express();
const mongoose = require("mongoose");
const morgan   = require('morgan');
const cookieParser = require('cookie-parser');
const expressValidator = require('express-validator');
require("dotenv").config();
//to read and and write the requestes
const cors = require('cors');

const authRoute          = require('./routes/auth');
const userRoute          = require('./routes/user');
const categoryRoute      = require('./routes/category');
const productRoute   = require('./routes/product');
const braintreeRoute = require('./routes/braintree');
const orderRoute     = require('./routes/order');
mongoose.connect(process.env.DATABASE,{
  useNewUrlParser :true,
  useCreateIndex :true
}).then(() => console.log("connected to the database"))


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(expressValidator());
//it should be here right after the validator
app.use(cors());




app.use('/api/product',productRoute);

app.use('/api/auth',authRoute);
app.use('/api/user',userRoute);
app.use('/api/category',categoryRoute);
app.use('/api/product',productRoute);
app.use('/api/braintree',braintreeRoute);
app.use('/api/order',orderRoute);

app.use(morgan('dev'));
app.use(cookieParser());

const port = process.env.PORT || 8000;
app.listen(port , ()=>{
  console.log(`connected to the port ${port}`);
});
