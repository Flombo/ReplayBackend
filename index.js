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

app.get('/', async(req, res) => {
    try {
        const replays = await MongoDBHandler.retrieveAllReplays(databaseName, databaseName);
        const replayHTML = ReplayBuilder.buildReplays(replays);
        res.render('index.ejs', {replayHTML: replayHTML, page: 1, pageMax: 6, error: null});
    } catch (exception) {
        console.error(exception);
        res.status(500).json({error: exception.message});
    }
})

app.post('/setreplays', async(req, res) => {
    try {
        const result = await MongoDBHandler.addReplay(databaseName, databaseName, req.body);
        res.send(result);
    } catch (exception) {
        console.error(exception)
        res.status(500).json({error: exception.message});
    }
});

app.get('/replays', async(req, res) => {
    const name = req.query.name;
    const result = await MongoDBHandler.retrieveReplays(databaseName, databaseName, name);
    res.json(result);
});

app.post('/pagination', async(req, res) => {
    try {
        const pageInfo = req.body.pageInfo;
        const currentPage = req.body.currentPage;
        const nextPage = await calculateNextPage(pageInfo, currentPage);
        const replays = await MongoDBHandler.retrieveAllReplays(databaseName, databaseName, nextPage);
        const replayHTML = ReplayBuilder.buildReplays(replays);
        const pageMax = await MongoDBHandler.getPageMax(databaseName, databaseName);
        let paginationEnd = nextPage + 6 >= pageMax ? pageMax : nextPage + 6;

        res.status(200).json({replayHTML: replayHTML, page: nextPage, paginationEnd: paginationEnd});
    } catch (exception) {
        console.error(exception);
        res.status(500).json({error: exception.message});
    }
});

async function calculateNextPage(pageInfo, currentPage) {
    const pageMax = await MongoDBHandler.getPageMax(databaseName, databaseName);
    let nextPage = currentPage;

    if(pageInfo === undefined) {
        throw 'pageInfo undefined';
    }

    if(isNaN(pageInfo.charAt(0))) {
        if (pageInfo === '+1' && currentPage < pageMax) {
            nextPage++;
        }

        if (pageInfo === '-1' && currentPage > 1) {
            nextPage--;
        }

        if(pageInfo === 'end') {
            nextPage = pageMax;
        }

        if(pageInfo === 'start') {
            nextPage = 1;
        }
    } else {
        nextPage = pageInfo;
    }

    return nextPage;
}

app.post('/getreplaydetails', async(req, res) => {
    try {
        const replayID = req.body.replayID;
        const replay = await MongoDBHandler.retrieveReplayDetails(databaseName, databaseName, replayID);
        const replayDetails = ReplayBuilder.buildReplayDetails(replay);
        res.status(200).json({replayDetails: replayDetails});

    } catch (exception) {
        console.error(exception);
        res.status(500).json({error: exception.message});
    }
});

app.post('/search', async(req, res) => {
   try {
        const searchString = req.body.searchString;
        const replays = await MongoDBHandler.searchReplaysByNameOrToken(databaseName, databaseName, searchString);
        const replayHTML = ReplayBuilder.buildReplays(replays);
        res.status(200).json({replayHTML: replayHTML});
   } catch (exception) {
        console.error(exception);
        res.status(500).json({error: exception.message});
   }
});

app.get('/filter', async(req, res) => {
   res.render('index.ejs');
});

server.listen(process.env.PORT, process.env.HOST);