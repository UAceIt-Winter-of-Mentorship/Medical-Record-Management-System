require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose= require("mongoose");
const app = express();
const passport= require("passport");
const session= require("express-session");
const passportLocalMongoose= require("passport-local-mongoose");
const findOrCreate= require("mongoose-findorcreate");
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(session({
  secret:"Min yoongi Cat",
  resave:false,
  saveUninitialized:false
}))
app.use(express.static("public"));

app.use(passport.initialize());
app.use(passport.session());
const URL= process.env.ATLAS_URL;
mongoose.connect(URL,{useUnifiedTopology: true,
useNewUrlParser:true});
mongoose.set('useCreateIndex', true);
const userSchema= new mongoose.Schema({
  email :String,
  password: String,
  googleId:String,
  secret:String
});
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
const User= new mongoose.model("user", userSchema);
passport.use(User.createStrategy());

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

app.get("/",function(req,res)
{
  res.render("home");
});

app.get("/login",function(req,res)
{
  res.render("login");
});

app.get("/register",function(req,res)
{
  res.render("register");
});
app.get("/mypage", function(req,res){
res.render("userpage");
});
app.get("/logout", function(req,res){
  req.logout();
  res.redirect("/");
});

app.post("/register", function(req,res)
{
  User.register({username:req.body.username}, req.body.password, function(err, user){
    if(err){
      console.log(err);
      res.redirect("/register");
    } else {
      passport.authenticate("local")(req, res , function(){
        res.redirect("/mypage");
      })
    }
  })
});
app.post("/login", function(req,res)
{
const user= new User({
  username:req.body.username,
  password: req.body.passsword
});
req.login(user, function(err){
  if(err){
    console.log(err)
  } else {
    passport.authenticate("local")(req, res, function(){
      res.redirect("/mypage");
    });
  }
});
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
