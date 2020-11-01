const mongoose = require("mongoose");
const findOrCreate = require('mongoose-findorcreate')
const passportLocal=require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy; 
//const findOrCreate = require('mongoose-findorcreate')
const passport=require('passport');

const userSchema=new mongoose.Schema({
    email:String,
    password:String,
    googleId:String
});

userSchema.plugin(passportLocal);
userSchema.plugin(findOrCreate);

const User=new mongoose.model("User",userSchema);



module.exports = User;