const express = require('express');
const ReplayBuilder = require("../ReplayBuilder.js");
const InfluxDBHandler = require("../database/InfluxDBHandler.js");
const router = express.Router();

router.get('/', async(req, res) => {
    try {
        const replays = '';
        InfluxDBHandler.query();
        // const replayHTML = ReplayBuilder.buildReplays(replays);
        res.render('index.ejs', {replayHTML: '<h1>Hello There</h1>', page: 1, pageMax: 6, error: null});
    } catch (exception) {
        console.error(exception);
        res.status(500).json({error: exception.message});
    }
});

router.post('/setreplays', async(req, res) => {
    try {
        const replayRecords = req.body;
        await InfluxDBHandler.writeReplayRecords(replayRecords);
        res.status(200);
    } catch (exception) {
        console.error(exception)
        res.status(500).json({error: exception.message});
    }
});

router.get('/replays', async(req, res) => {
    try {
        InfluxDBHandler.mean()
        const name = req.query.name;
        const result = ''
        res.json(result);
    } catch (exception) {
        console.error(exception);
        res.status(500).json({error: exception.message});
    }
});

router.post('/getreplaydetails', async(req, res) => {
    try {
        const replayID = req.body.replayID;
        const replay = {}
        const replayDetails = ReplayBuilder.buildReplayDetails(replay);
        res.status(200).json({replayDetails: replayDetails});

    } catch (exception) {
        console.error(exception);
        res.status(500).json({error: exception.message});
    }
});

router.get('/filter', async(req, res) => {
    res.render('index.ejs');
});

router.post('/pagination', async(req, res) => {
    try {
        const pageInfo = req.body.pageInfo;
        const currentPage = req.body.currentPage;
        const searchString = req.body.searchString;
        const timestampFilter = req.body.timestampFilter;
        const nextPage = await calculateNextPage(pageInfo, currentPage, searchString);
        // const replays = await MongoDBHandler.retrieveAllReplays(nextPage, searchString, timestampFilter);
        const replays = {}
        // const replayHTML = ReplayBuilder.buildReplays(replays);
        // const pageMax = await MongoDBHandler.getPageMax(searchString);
        const pageMax = 1;
        let paginationEnd = nextPage + 6 >= pageMax ? pageMax : nextPage + 6;

        res.status(200).json({replayHTML: '<h1>Hello There</h1>', page: nextPage, paginationEnd: paginationEnd});
    } catch (exception) {
        console.error(exception);
        res.status(500).json({error: exception.message});
    }
});

async function calculateNextPage(pageInfo, currentPage, searchString) {
    // const pageMax = await MongoDBHandler.getPageMax(searchString);
    const pageMax = 5;

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

module.exports = router;