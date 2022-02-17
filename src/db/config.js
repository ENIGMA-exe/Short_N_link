require('dotenv').config();
const mongoose = require('mongoose');

//database:- polynomial;

const mongo_connection = ()=>{
    // const DB_URL = "mongodb://localhost:27017/polynomial";

    mongoose.connect(process.env.DB_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    }).then(() => {
        console.log('connect successfully')
    }).catch((err) => {
        console.log('error in db connection')
        console.log(err);
    });
}

module.exports = mongo_connection;