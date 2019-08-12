require("dotenv").config();
const express = require("express"),
      bodyParser = require("body-parser"),
      ejs = require("ejs"),
      mongoose = require("mongoose"),
      session = require("express-session"),
      passport = require("passport"),
      passportLocalMongoose = require("passport-local-mongoose");


const app = express();
app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));  

app.use(session({
    secret: "I am IronMan and I will absolutely save the universe from thanos",
    resave: false,
    saveUninitialized : false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true}); 
mongoose.set("useCreateIndex", true);


//user Schema DB works
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

//For encryption purpose
//  const secret = process.env.SECRET;
//  userSchema.plugin(encrypt,{secret:secret, encryptedFields:["password"]});

const User = mongoose.model("User",userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//Initial routes
app.get("/",function(req,res){
    res.render("home");
});

app.get("/login",function(req,res){
    res.render("login");
});


app.get("/register",function(req,res){
    res.render("register");
});

app.get("/secrets",function(req,res){
   if (req.isAuthenticated()) {
     res.render("secrets");
   } else {
       res.redirect("login");
   }
});

//REGISTER(Create Users)
app.post("/register",function(req,res){
  
    User.register({username: req.body.username},req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            });
        }
    });

});

//LOGIN
app.post("/login",function(req,res){

   const user = new User({
       username: req.body.username,
       password: req.body.password
   })

    req.login(user, function(err){
        if (err) {
            console.log(err)
        } else {
            passport.authenticate("local")(req,res,function(){
            res.redirect("/secrets");
        });
    }
    });

});


//server start
const port = process.env.PORT || 3000
app.listen(port,function(){
    console.log("Server Started at Port 3000");
});