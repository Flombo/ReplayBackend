const express = require('express');
const app = express();
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));
const http = require('http');
require('dotenv').config();
const server = http.createServer(app);
app.set('view engine', 'ejs');
app.use(express.static(__dirname));
const replayRoutes = require('./routes/ReplayRoutes.js');

app.use('/', replayRoutes);
app.use('/setreplays', replayRoutes);
app.use('/replays', replayRoutes);
app.use('/pagination', replayRoutes);
app.use('/getreplaydetails', replayRoutes);
app.use('/filter', replayRoutes);

server.listen(process.env.PORT, process.env.HOST);