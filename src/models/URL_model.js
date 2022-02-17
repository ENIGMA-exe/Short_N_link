const mongoose = require('mongoose');
const validator = require('validator');

const URL_schema = mongoose.Schema({
    user_id:{
        type:String,
        require:[true,'no user id found']
    },
    URL:{
        type:String,
        validator(value){ if(!validator.isURL(value)){ throw new Error('invalid URL')} }
    },
    SURL:{
        type:String
    },
    sstr:{
        type:String
    },
    createdAT:{ 
        type: Date, 
        expires: '3m', 
        default: Date.now 
    }
})

const URL_detail = mongoose.model('URL detail',URL_schema);
module.exports = URL_detail;