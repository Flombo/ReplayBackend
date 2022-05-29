const express = require('express');
const app = express();
app.use(express.json({limit: '150mb'}));
app.use(express.urlencoded({limit: '150mb', extended: true, parameterLimit: 150000}));
const http = require('http');
require('dotenv').config();
const server = http.createServer(app);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
const replayRoutes = require('./routes/ReplayRoutes.js');

app.use('/', replayRoutes);
app.use('/setreplays', replayRoutes);
app.use('/replays', replayRoutes);
app.use('/createtimelineevent', replayRoutes);
app.use('/gettimelineevents', replayRoutes);
app.use('/getreplayrecordsamount', replayRoutes);
app.use('/getreplaycollectionobjects', replayRoutes);
app.use('/getreplayrecordbatch', replayRoutes);
app.use('/pagination', replayRoutes);
app.use('/getreplaydetails', replayRoutes);
app.use('/filter', replayRoutes);

server.listen(process.env.PORT, process.env.HOST);