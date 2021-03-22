//jshint esversion:6
require('dotenv').config()
const express = require("express")
const ejs = require("ejs")
const mongoose = require("mongoose")
const encrypt = require("mongoose-encryption")
// level 3 hashing
// const md5 = require("md5")
// level 4 salting and hashing 
const bcrypt = require('bcrypt');
const saltRounds = 10;



const app = express()
app.use(express.static("public"))
app.use(express.urlencoded({extended:true}))

app.set("view engine", "ejs")

mongoose.connect("mongodb://localhost:27017/usersDB",{useNewUrlParser:true},{ useUnifiedTopology: true } )

const userSchema = new mongoose.Schema ({
    email:String,
    password:String
})

// Level2 using encryption(secret), sent to .env


userSchema.plugin(encrypt, {secret:process.env.secret, encryptedFields:["password"]})

const User = mongoose.model("User", userSchema)

app.get("/",(req,res)=>{
    res.render('home')
})
app.get("/register",(req,res)=>{
    res.render('register')
})
app.get("/login",(req,res)=>{
    res.render('login')
})

app.post("/register",(req,res)=>{

    bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
        // Store hash in your  usersDB.
        const newUser = new User( {
            email:req.body.username,
            password:hash
        })
    
        newUser.save((err)=>{
            if (!err) {
                res.render("secrets")
            }
        })
        
    });

    
})


app.post("/login",(req,res)=>{
    const username = req.body.username
    const password = req.body.password 

    User.findOne({email: username},(err,foundUser)=>{
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {
                bcrypt.compare(password, foundUser.password, function(err, result) {
                    // result == true
                    res.render("secrets")
                });
            }
        }

    })
})













app.listen(3000,()=>{
    console.log("App is up and running!!!");
})


