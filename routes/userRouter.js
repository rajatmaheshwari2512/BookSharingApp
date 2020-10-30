require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs=require('ejs');
const mongoose=require('mongoose');
const encrypt=require('mongoose-encryption');
const passport=require('passport');
const passportLocal=require('passport-local-mongoose');
const port = 3000
const userRouter=express.Router();
const session=require('express-session');
const GoogleStrategy = require('passport-google-oauth20').Strategy; 
const findOrCreate = require('mongoose-findorcreate')
const User = require("../models/user");



userRouter.use(express.static("public"));
// userRouter.set('view engine', 'ejs');

userRouter.use(session({
    secret:"This is my secret.",
    resave:false,
    saveUnintialised:false
}));

userRouter.use(passport.initialize());
userRouter.use(passport.session());

mongoose.connect("mongodb://localhost:27017/usersBook",{useNewUrlParser:true,useUnifiedTopology: true});
mongoose.set("useCreateIndex",true);


passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
    done(null, user.id);
  });
  
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

passport.use(new GoogleStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "http://localhost:3000/user/auth/google/secrets",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  },
  function(accessToken, refreshToken, profile, cb) {
    User.findOrCreate({ googleId: profile.id }, function (err, user) {
      return cb(err, user);
    });
  }
));


userRouter.use(bodyParser.urlencoded({
    extended:true
}));

userRouter.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] })
);

userRouter.get("/auth/google/secrets", 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/user/home');
  });

userRouter.get('/signup', (req, res) => {
  
    res.render("signup");
    
    
})

userRouter.get('/home', (req, res) => {
    if(req.isAuthenticated()){
        res.send("this is the home redirect!");
    }else{
        res.send("shit");
    }

});

userRouter.post('/register', (req, res) => {
    User.register({
        username:req.body.username,        
    },
    req.body.password,
    function(err,user){
        if(err){
            console.log(err);
             res.redirect('signup');
        }
        else{
            passport.authenticate("local")(req,res,function(){
            	console.log("Successful");
                  res.redirect('/user/home');   
            })
        }
    }
    );
});

userRouter.get('/login', (req, res) => {
    res.render('login');
});

userRouter.post('/login', (req, res) => {
    const user = new User({
        username:req.body.username,
        password:req.body.password
    });

    req.login(user,function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect('home');   
          })
        }
    })

});

userRouter.get('/logout', (req, res) => {
    req.logout();
     res.redirect('home');
});


module.exports = userRouter;