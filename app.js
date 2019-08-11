require("dotenv").config();
const express = require("express"),
      bodyParser = require("body-parser"),
      ejs = require("ejs"),
      mongoose = require("mongoose"),
      md5 = require("md5");
      //encrypt = require("mongoose-encryption");


const app = express();
app.use(express.static("public"));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));  
mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true}); 


//user Schema DB works
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

//For encryption purpose
//  const secret = process.env.SECRET;
//  userSchema.plugin(encrypt,{secret:secret, encryptedFields:["password"]});

const User = mongoose.model("User",userSchema);


//Initial routes
app.get("/",function(req,res){
    res.render("home");
})

app.get("/login",function(req,res){
    res.render("login");
})


app.get("/register",function(req,res){
    res.render("register");
})

//REGISTER(Create Users)
app.post("/register",function(req,res){
    User.create({
        email: req.body.username,
        password: md5(req.body.password)
    },function(err){
        if (!err) {
            res.render("secrets");
        } else {
            console.log(err);
        }
    })
});

//LOGIN
app.post("/login",function(req,res){
    const username = req.body.username;
    const password = md5(req.body.password)

    User.findOne({email:username},function(err,foundUser){
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                if (foundUser.password === password) {
                    res.render("secrets");
                }
            }
        }
    })
})


//server start
const port = process.env.PORT || 3000
app.listen(port,function(){
    console.log("Server Started at Port 3000");
});