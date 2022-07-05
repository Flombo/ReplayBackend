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
const WebSocket = require('ws');
const MongoDBHandler = require("./database/MongoDBHandler");
const wss = new WebSocket.Server({
    port: 8000
});
const {Decoder} = require("@msgpack/msgpack");
const messagePackToJSONDeserializer = require('./MessagePackToJSONDeserializer.js');
const decoder = new Decoder();

wss.on('connection', function(socket) {
    socket.on('message', async (msg) =>  {
        const decodedMSG = decoder.decode(msg);
        const deserializedMSG = messagePackToJSONDeserializer.deserializeMessage(decodedMSG);

        if(deserializedMSG.MessageType === "createtimelineevent") {
            console.log(deserializedMSG)
        }

        await checkMessageType(deserializedMSG, socket)
    });

    socket.on('error', function () {
        socket.terminate();
    });

    //When a socket closes, or disconnects, remove it from the array.
    socket.on('close', function() {
        socket.close();
    });
});

async function checkMessageType(parsedMSG, socket) {
    switch (parsedMSG.MessageType) {
        case "getreplaybatch":
            try {
                let result = await MongoDBHandler.getReplayRecordsForCertainGameObject(
                    parsedMSG.ReplayName,
                    parsedMSG.Name
                );
                if (result !== null && result.length > 0) {
                    socket.send(JSON.stringify(result), true);
                }
                result = null;
            } catch (exception) {
                console.log(exception)
                socket.send(exception.message);
            }
            break;
        case "getaudiorecords":
            try {
                const result = await MongoDBHandler.getAudioRecords(
                    parsedMSG.ReplayName,
                    parsedMSG.Name
                );
                if (result !== null && result.length > 0) {
                    socket.send({message: "audiorecords", result}, true);
                }
            } catch (exception) {
                console.log(exception)
                socket.send(exception.message);
            }
            break;
        case "getanimationrecords":
            try {
                const result = await MongoDBHandler.getAnimationRecords(
                    parsedMSG.ReplayName,
                    parsedMSG.Name
                );
                if (result !== null && result.length > 0) {
                    socket.send({message: "animationrecords", result}, true);
                }
            } catch (exception) {
                console.log(exception)
                socket.send(exception.message);
            }
            break;
        case "setreplayrecords":
            try {
                await MongoDBHandler.addReplayRecords(
                    parsedMSG.ReplayName,
                    parsedMSG.ReplayRecords
                );
            } catch (exception) {
                console.log(exception)
                socket.send(exception.message);
            }
            break;
        case "setaudiorecords":
            try {
                await MongoDBHandler.addAudioRecords(
                    parsedMSG.ReplayName,
                    parsedMSG.AudioRecords
                )
            } catch (exception) {
                console.error(exception);
                socket.send(exception.message);
            }
            break;
        case "setanimationrecords":
            try {
                await MongoDBHandler.addAnimationRecords(
                    parsedMSG.ReplayName,
                    parsedMSG.AnimationRecords
                )
            } catch (exception) {
                console.error(exception);
                socket.send(exception.message);
            }
            break;
        case "createtimelineevent":
            try {
                await MongoDBHandler.createTimeLineEvent(parsedMSG);
            } catch (exception) {
                console.log(exception)
                socket.send(exception.message);
            }
            break;
        case "gettimelineevents":
            try {
                let result = await MongoDBHandler.getTimelineEvents(
                    parsedMSG.ReplayName
                );
                if (result !== null) {
                    socket.send(JSON.stringify(result), true);
                }
                result = null;
            } catch (exception) {
                console.log(exception)
                socket.send(exception.message);
            }
            break;
    }
}

app.use('/', replayRoutes);
app.use('/setreplays', replayRoutes);
app.use('/replays', replayRoutes);
app.use('/getreplayrecordsamount', replayRoutes);
// app.use('/getreplayrecordbatch', replayRoutes);
app.use('/getreplaycollectionobjects', replayRoutes);
app.use('/pagination', replayRoutes);
app.use('/getreplaydetails', replayRoutes);
app.use('/filter', replayRoutes);

server.listen(process.env.PORT, process.env.HOST);