"use strict"
const path = require('path');
const http = require('http');
const express = require('express');
const app = express();
const util = require("util");
const dotenv = require("dotenv");
const starLinkData = require('./utils/rawPV.json');
const roundDown = require('./utils/roundDown');
dotenv.config();
const PORT = process.env.PORT || 80;
app.use(express.static(path.join(__dirname, "../client")));
app.get("/", (req, res) => {
    res.sendFile("/index.html");
});
const httpServer = http.createServer(app);
httpServer.listen(PORT, () => {
    console.log(`Listening to ${PORT}`);
});
const io = require("socket.io")(httpServer);
io.on("connection", socket => {
    
})
