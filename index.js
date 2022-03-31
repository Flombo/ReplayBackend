const express = require('express');
const app = express();
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));
const http = require('http');
require('dotenv').config();
const MongoDBHandler = require("./MongoDBHandler.js");
const server = http.createServer(app);
app.set('view engine', 'ejs');
app.use(express.static(__dirname));
const databaseName = 'replays';

app.get('/', (req, res) => {
    console.log('Hello there')
    res.render('index.ejs');
})

app.post('/setreplays', async(req, res) => {
    try {
        const result = await MongoDBHandler.addReplay(databaseName, databaseName, req.body);
        res.send(result);
    } catch (exception) {
        console.log(exception)
        res.send(exception);
    }
});

app.get('/replays', async(req, res) => {
    const name = req.query.name;
    console.log(MongoDBHandler)
    const result = await MongoDBHandler.retrieveReplays(databaseName, databaseName, name);
    res.json(result);
});

server.listen(process.env.PORT, process.env.HOST);