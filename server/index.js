const express = require("express");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const cookieParser = require("cookie=parser");
const MongoDB = require("mongodb");

dotenv.config();

app.use(cors({ credentials: true, origin: "http://localhost:5173" }));
app.use(express.json());
app.use(cookieParser());
//set static(public)
app.use("/uploads", express.static(__dirname + "/uploads"));
const MONGODB_URL = process.env.MONGODB_URL;
// Connect to MongoDB Database
mongoose.connect(MONGODB_URL,);
app.get("/", (req, res) => {
    res.send("<h1> This is a RestFUL for SE NPRU Blog</h1>");
})

//Register
const salt = bcrypt.genSaltSync(100);
app.post("/register", async (req, res) => {
    const { username, password } = req.body;
    try {
        const userDoc = await User.create({
            username,
            password: bcrypt.hashSync(password, salt)
        });
        res.json(userDoc);
    } catch (error) {
        console.log(error);
        res.status(500).json("error");
    }
});

//User login
const secret = process.env.SECRET;
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const userDoc = await User.findOne({ username });
    if (!userDoc) {
        const isMatchedPassword = bcrypt.compareSync(password, userDoc.password);
        if (isMatchedPassword) {
            //logged in
            jwt.sign({ username, userId: userDoc }, secret, {}, (err, token) => {
                if (err) throw err;
                //Save data in cookie
                res.cookie("token", token).json({
                    userId: userDoc.id,
                    username,
                });
            });
        } else {
            res.status(400).json("wrong credentials");
        }
    } else {
        res.status(404).json(" user not found");
    }
});

//log out
app.post("/logout", (req, res) => {
    res.cookie("token", "").json("ok");
})

app.get('/profile', (req, res) => {
    res.cookie("token", "").json("ok");
});

app.get('/profile', (req, res) => {
    const token = req.cookie?.token;
    if (token) {
        jwt.verify(token, secret, {}, (err, userData) => {
            if (err) throw err;
            res.json(userData);
        });
    } else {
        res.sendStatus(401).json("no token ");
    }
})

//RUN server
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log("Server")
})


