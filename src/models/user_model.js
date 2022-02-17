const mongoose = require('mongoose');
const validator = require('validator');
const bc = require('bcrypt');
const { links } = require('express/lib/response');

const user_schema = mongoose.Schema({

    user_id:{
        type:String,
        default:"user_"
    },
    fname:{
        type:String,
        require:[true,'no fname found']
    },
    lname:{
        type:String,
        require:[true,'no lname found']
    },
    email:{
        type:String,
        require:[true,'no email found'],
        unique:true,
        validator(value){
            if(!validator.isEmail(value)){
                throw new Error('invalid Email Id');
            };
        }
    },
    pwd:{
        type:String,
        require:[true,'password must be there.']
    },

    total_links:{
        type:Number,
        default:0
    },
    links:{
        type:Array,
        default:[]
    },

    // links:[{
    //     URL:{
    //         type:String,
    //         validator(value){ if(!validator.isURL(value)){ throw new Error('invalid URL')} }
    //     },
    //     short_string:{type:String},
    //     createdAT:{ type: Date, expires: '1m', default: Date.now }
    // }]
},{timestamps:true})


user_schema.pre("save",async function(next){
    if(this.isModified("pwd")){
        this.pwd = await bc.hash(this.pwd,10);
    }
    next();
})

const user_detail = mongoose.model('user detail',user_schema);

module.exports = user_detail;