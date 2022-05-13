const express = require('express');
const ReplayBuilder = require("../ReplayBuilder.js");
const MongoDBHandler = require("../database/MongoDBHandler.js");
const router = express.Router();

router.get('/', async(req, res) => {
    try {
        const replays = await MongoDBHandler.retrieveAllReplays(1, '', '');
        const replayHTML = ReplayBuilder.buildReplays(replays);
        res.render('index.ejs', {replayHTML: replayHTML, page: 1, pageMax: 6, error: null});
    } catch (exception) {
        handleException(res, exception);
    }
});

router.post('/createtimelineevent', async(req, res) => {
    try {
        const timelineEvent = req.body;
        await MongoDBHandler.createTimeLineEvent(timelineEvent);
        res.status(200);
    } catch (exception) {
        handleException(res, exception);
    }
});

router.post('/setreplays', async(req, res) => {
    try {
        await MongoDBHandler.addReplayRecords(req.body);
        res.status(200);
    } catch (exception) {
        handleException(res, exception);
    }
});

router.get('/getreplaycollectionobjects', async(req, res) => {
   try {
       const userName = req.query.username;
       const replayCollectionObjects = await MongoDBHandler.getReplayCollectionObjects(userName);
       res.status(200).json({replayCollectionObjects : replayCollectionObjects});
   } catch (exception) {
       handleException(res, exception);
   }
});

router.get('/getreplayrecordsamount', async(req, res) => {
    try {
        const replayName = req.query.replayName;
        const result = await MongoDBHandler.getReplayRecordsAmount(replayName);
        res.status(200).json(result);
    } catch (exception) {
        handleException(res, exception);
    }
});

router.get('/getreplayrecordbatch', async(req, res) => {
   try {
        const replayName = req.query.replayName;
        const batchSize = req.query.batchSize;
        const currentTimelineKnobPosition = req.query.currentTimelineKnobPosition;

        const result = await MongoDBHandler.getReplayRecordBatch(replayName, batchSize, currentTimelineKnobPosition);
        res.status(200).json({replayRecords: result});
   } catch (exception) {
       handleException(res, exception);
   }
});

router.get('/gettimelineevents', async(req, res) => {
    try {
        const replayName = req.query.replayName;
        const result = await MongoDBHandler.getTimelineEvents(replayName);
        res.json(result);
    } catch (exception) {
        handleException(res, exception);
    }
});

router.get('/replays', async(req, res) => {
    try {
        const name = req.query.name;
        const result = await MongoDBHandler.retrieveReplays(name);
        res.json(result);
    } catch (exception) {
        handleException(res, exception);
    }
});

router.post('/getreplaydetails', async(req, res) => {
    try {
        const replay = {}
        const replayDetails = ReplayBuilder.buildReplayDetails(replay);
        res.status(200).json({replayDetails: replayDetails});

    } catch (exception) {
        handleException(res, exception);
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
        const replays = await MongoDBHandler.retrieveAllReplays(nextPage, searchString, timestampFilter);
        const replayHTML = ReplayBuilder.buildReplays(replays);
        const pageMax = await MongoDBHandler.getPageMax(searchString);
        let paginationEnd = nextPage + 6 >= pageMax ? pageMax : nextPage + 6;

        res.status(200).json({replayHTML: replayHTML, page: nextPage, paginationEnd: paginationEnd});
    } catch (exception) {
        handleException(res, exception);
    }
});

function handleException(res, exception) {
    console.error(exception);
    res.status(500).json({error: exception.message});
}

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

module.exports = router;