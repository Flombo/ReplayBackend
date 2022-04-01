const express = require('express');
const app = express();
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true, parameterLimit: 50000}));
const http = require('http');
require('dotenv').config();
const MongoDBHandler = require("./MongoDBHandler.js");
const ReplayBuilder = require("./ReplayBuilder.js");
const server = http.createServer(app);
app.set('view engine', 'ejs');
app.use(express.static(__dirname));
const databaseName = 'replays';
const page = 1;

app.get('/', async(req, res) => {
    try {
        const replays = await MongoDBHandler.retrieveAllReplays(databaseName, databaseName);
        const replayHTML = ReplayBuilder.buildReplays(replays);
        const pageMax = await MongoDBHandler.getPageMax(databaseName, databaseName);
        res.render('index.ejs', {replayHTML: replayHTML, page: page, pageMax: pageMax, error: null});
    } catch (exception) {
        console.error(exception);
    }
})

app.post('/setreplays', async(req, res) => {
    try {
        const result = await MongoDBHandler.addReplay(databaseName, databaseName, req.body);
        res.send(result);
    } catch (exception) {
        console.error(exception)
        res.send(exception);
    }
});

app.get('/replays', async(req, res) => {
    const name = req.query.name;
    const result = await MongoDBHandler.retrieveReplays(databaseName, databaseName, name);
    res.json(result);
});

app.get('/search', async(req, res) => {
   res.render('index.ejs');
});

app.get('/filter', async(req, res) => {
   res.render('index.ejs');
});

server.listen(process.env.PORT, process.env.HOST);