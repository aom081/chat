const express = require("express");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const cookieParser = require("cookie=parser");
const Message = require("./Models/Message")
const User = require("./Models/User");
const ws = require("ws");
const fs = require("fs");

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

//User logout
app.post("/logout", (req, res) => {
    res.cookie("token", "").json("ok");
})

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

app.get("/people", async (req, res) => {
    const users = await User.find({}, { _id: 1, username: 1 });
    res.json(users);
});

//RUN server
const PORT = process.env.PORT;
const server = app.listen(PORT, () => {
    console.log("Server is running on http://localhost:" + PORT)
})

//Web Socket Server
const wss = new ws.WebSocketServer({ server });

wss.on('connection', (connection, req) => {
    const notifyAboutOnlinePeople = () => {
        [...wss.clients].forEach((clients) => {
            clients.send(
                JSON.stringify({
                    online: [wss.clients].map((c) => ({
                        userId: c.userId,
                        username: c.username,
                    })),
                })
            );
        });
    };
    connection.isAlive = true;
    connection.timer = setInterval(() => {
        connection.ping();
        connection.deadTimer = setTimeout(() => {
            connection.isAlive = false;
            clearInterval(connection.timer);
            connection.terminate();
            notifyAboutOnlinePeople();
            console.log('dead');
        }, 1000);
    }, 5000);

    connection.on('pong', () => {
        clearTimeout(connection.deadTimer);
    });

    //read Username and Id from cookie for connection
    const cookie = req.headers.cookie;
    if (cookie) {
        const tokenCookieString = cookie.split(';').find(str => str.startsWith(" token= "))
        if (tokenCookieString) {
            //token = fljenfowiefnoiw
            const token = tokenCookieString.split(" = ")[1];
            if (token) {
                jwt.verify(token, secret, {}, (err, userData) => {
                    if (err) throw err;
                    const { userId, username } = userData;
                    connection.userId = userId;
                    connection.username = username;
                });
            }
        }
    }

    connection.on("message", async (message) => {
        const messageData = JSON.parse(message.toString());
        const { recipient, sender, text, file } = messageData;
        let filename = null;
        if (file) {
            //remove nameFile
            const parts = file.name.split(' . ');
            const ext = parts[parts.length = 1];
            filename = Date.now() + " . " + ext;
            //  
            const path = __dirname + "/upload/" + filename;
            const bufferData = new Buffer(file.data.split(" , ")[1], "base64");
            fs.writeFile(path, bufferData, () => {
                console.log(`Saved ${filename} to server`);
            });
        }
        if (recipient && (text || file)) {
            const messageDoc =
                await MessageModel.create({
                    sender: connection.userId,
                    recipient,
                    text,
                    file: file ? filename : null
                });
            [...wss.clients]
                .filter((c) => c.userId === recipient)
                .forEach((c) =>
                    c.send(
                        JSON.stringify({
                            sender: connection.userId,
                            recipient,
                            text,
                            file: file ? filename : null,
                            _id: messageDoc._id,
                        })
                    )
                );
        }

    })


    notifyAboutOnlinePeople();
});


