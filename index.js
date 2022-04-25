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

app.get('/', async(req, res) => {
    try {
        const replays = await MongoDBHandler.retrieveAllReplays();
        const replayHTML = ReplayBuilder.buildReplays(replays);
        res.render('index.ejs', {replayHTML: replayHTML, page: 1, pageMax: 6, error: null});
    } catch (exception) {
        console.error(exception);
        res.status(500).json({error: exception.message});
    }
})

app.post('/setreplayheader', async(req, res) => {
    try {
        const result = await MongoDBHandler.addReplayHeader(req.body);
        res.status(200).json({result: result});
    } catch (exception) {
        console.error(exception);
        res.status(500).json({error: exception.message});
    }
});

app.post('/setreplays', async(req, res) => {
    try {
        const result = await MongoDBHandler.addReplayRecords(req.body);
        res.status(200).json({result: result});
    } catch (exception) {
        console.error(exception)
        res.status(500).json({error: exception.message});
    }
});

app.get('/replays', async(req, res) => {
    const name = req.query.name;
    const result = await MongoDBHandler.retrieveReplays(name);
    res.json(result);
});

app.post('/pagination', async(req, res) => {
    try {
        const pageInfo = req.body.pageInfo;
        const currentPage = req.body.currentPage;
        const searchString = req.body.searchString;
        const timestampFilter = req.body.timestampFilter;
        const nextPage = await calculateNextPage(pageInfo, currentPage, searchString);
        const replays = await MongoDBHandler.retrieveAllReplays(nextPage, searchString, timestampFilter);
        const replayHTML = ReplayBuilder.buildReplays(replays);
        const pageMax = await MongoDBHandler.getPageMax(searchString);
        let paginationEnd = nextPage + 6 >= pageMax ? pageMax : nextPage + 6;

        res.status(200).json({replayHTML: replayHTML, page: nextPage, paginationEnd: paginationEnd});
    } catch (exception) {
        console.error(exception);
        res.status(500).json({error: exception.message});
    }
});

async function calculateNextPage(pageInfo, currentPage, searchString) {
    const pageMax = await MongoDBHandler.getPageMax(searchString);

    if(pageInfo === undefined) {
        throw 'pageInfo undefined';
    }

    if(isNaN(pageInfo) && isNaN(pageInfo.charAt(0))) {
        if (pageInfo === 'forwards' &&  currentPage + 1 <= pageMax) {
            currentPage++;
        }

        if (pageInfo === 'previous' && currentPage - 1 >= 1) {
            currentPage--;
        }

        if(pageInfo === 'end') {
            currentPage = pageMax;
        }

        if(pageInfo === 'start') {
            currentPage = 1;
        }
    } else {
        currentPage = pageInfo;
    }

    return currentPage;
}

app.post('/getreplaydetails', async(req, res) => {
    try {
        const replayID = req.body.replayID;
        const replay = await MongoDBHandler.retrieveReplayDetails(replayID);
        const replayDetails = ReplayBuilder.buildReplayDetails(replay);
        res.status(200).json({replayDetails: replayDetails});

    } catch (exception) {
        console.error(exception);
        res.status(500).json({error: exception.message});
    }
});

app.get('/filter', async(req, res) => {
   res.render('index.ejs');
});

server.listen(3000, 'localhost');