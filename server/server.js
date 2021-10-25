"use strict"
const path = require('path');
const http = require('http');
const express = require('express');
const app = express();
const util = require("util");
const dotenv = require("dotenv");
const veloCalc = require('./utils/velocityCalc');
const starLinkData = require('./utils/rawPV.json');
const roundDown = require('./utils/roundDown');
const data = require('./dataToUse.json');
const fs = require('fs');
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
    // console.log(data);
    socket.emit('init', data);
    setInterval(async () => {
        await veloCalc();
        await roundDown(starLinkData);
        let dataToSend = await fs.readFileSync('./dataToUse.json', 'utf-8', (err) => {
            if (err) console.log(err);
        });
        console.log(dataToSend);
        socket.emit('updateData', dataToSend);
    }, 20000);
});
