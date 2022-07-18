const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const uri = process.env.MONGODB;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const databaseName = process.env.MONGODBDATABASE;
const replayRecordsCollectionName = process.env.REPLAYCOLLECTIONNAME;
const audioRecordsCollectionName = process.env.AUDIOCOLLECTIONNAME;
const animationRecordsCollectionName = process.env.ANIMATIONCOLLECTIONNAME;
const timelineEventsCollectionName = process.env.TIMELINEEVENTSCOLLECTIONNAME;
const { DateTime } = require("luxon");

class MongoDBHandler {

    mongoDBConnection = null;
    pageSize = 20;
    setIndices = false;
    setTimelineIndices = false;

    constructor() {
        if(this.mongoDBConnection === null || this.mongoDBConnection === undefined) {
            this.createMongoDBConnection();
        }
    }

    async createMongoDBConnection() {
        try {
            this.mongoDBConnection = await client.connect();
        } catch (exception) {
            console.error(exception);
        }
    }

    async createIndices(replayName) {
        try {
            if(this.setIndices) return;

            this.mongoDBConnection.db(databaseName).collection(replayName + replayRecordsCollectionName).createIndex({
                Timestamp: 1,
                Name: 1
            });

            this.setIndices = true;
        } catch (exception) {
            throw exception;
        }
    }

    async createTimelineEventIndizes(replayName) {
        try {
            if(this.setTimelineIndices) return;
            this.mongoDBConnection.db(databaseName).collection(replayName + timelineEventsCollectionName).createIndex({
                StartTime: 1
            });
            this.setTimelineIndices = true;
        } catch (exception) {
            throw exception;
        }
    }

    async createTimeLineEvent(timelineEvent) {
        try {
            const replayName = timelineEvent.ReplayName;
            return this.mongoDBConnection.db(databaseName).collection(replayName + timelineEventsCollectionName).insertMany(timelineEvent);
        } catch (exception) {
            throw exception;
        }
    }

    /**
     * @param replayName
     * @param replayRecords
     */
    async addReplayRecords(replayName, replayRecords) {
        try {
            return this.mongoDBConnection.db(databaseName).collection(replayName + replayRecordsCollectionName).insertMany(replayRecords);
        } catch (exception) {
            throw exception;
        }
    }

    /**
     * @param ReplayName
     * @param AudioRecords
     */
    async addAudioRecords(ReplayName, AudioRecords) {
        try {
            return this.mongoDBConnection.db(databaseName).collection(ReplayName + audioRecordsCollectionName).insertMany(AudioRecords);
        } catch (exception) {
            throw exception;
        }
    }

    async addAnimationRecords(ReplayName, AnimationRecords) {
        try {
            return this.mongoDBConnection.db(databaseName).collection(ReplayName + audioRecordsCollectionName).insertMany(AnimationRecords);
        } catch (exception) {
            throw exception;
        }
    }

    async getReplayRecordsAmount(replayName) {
        try {
            return this.mongoDBConnection.db(databaseName).collection(replayName + replayRecordsCollectionName).countDocuments();
        } catch (exception) {
            throw exception;
        }
    }

    async getReplayRecords(replayName) {
        try {
            return await this.mongoDBConnection.db(databaseName).collection(replayName + replayRecordsCollectionName).find().sort({Timestamp: 1}).toArray();
        } catch (exception) {
            throw exception;
        }
    }

    async getAudioRecords(replayName, gameObjectName) {
        try {
            await this.createIndices(replayName);
            return await this.mongoDBConnection.db(databaseName).collection(replayName + audioRecordsCollectionName).find({GameObjectName : gameObjectName}).sort({Timestamp: 1}).toArray();
        } catch (exception) {
            throw exception;
        }
    }

    async getAnimationRecords(replayName, gameObjectName) {
        try {
            await this.createIndices(replayName);
            return await this.mongoDBConnection.db(databaseName).collection(replayName + animationRecordsCollectionName).find({GameObjectName : gameObjectName}).sort({Timestamp: 1}).toArray();
        } catch (exception) {
            throw exception;
        }
    }

    async getReplayRecordBatch(replayName, batchSize, currentTimelineKnobPosition, name) {
        try {
            const start = Math.abs(Math.round(currentTimelineKnobPosition - batchSize / 2));
            const starttime = replayName.split('_')[0].replace('_', '');
            const currentStart = DateTime.fromISO(starttime).plus(start);
            const currentEnd = currentStart.plus(batchSize);
            await this.createIndices(replayName);

            return await this.mongoDBConnection.db(databaseName).collection(replayName + replayRecordsCollectionName).find(
                {
                    GameObjectName: name,
                    Timestamp: {
                        $gte: currentStart.toUTC().toString(),
                        $lte: currentEnd.toUTC().toString()
                    }
                }
            ).sort({Timestamp: 1}).toArray();
        } catch (exception) {
            throw exception;
        }
    }

    async getReplayRecordsForCertainGameObject(replayName, name) {
        try {
            await this.createIndices(replayName);
            return await this.mongoDBConnection.db(databaseName).collection(replayName + replayRecordsCollectionName).find({GameObjectName : name}).sort({Timestamp: 1}).toArray();
        } catch (exception) {
            throw exception;
        }
    }

    async getTimelineEvents(replayName) {
        try {
            await this.createTimelineEventIndizes(replayName);
            return await this.mongoDBConnection.db(databaseName).collection(replayName + timelineEventsCollectionName).find().sort({Starttime: 1}).toArray();
        } catch (exception) {
            throw exception;
        }
    }

    async getTimelineEventsCount(replayName) {
        try {
            return await this.mongoDBConnection.db(databaseName).collection(replayName + timelineEventsCollectionName).countDocuments();
        } catch (exception) {
            throw exception;
        }
    }

    async getReplayCollectionObjects(userName) {
        try {
            const regEx = new RegExp('.*' + userName + replayRecordsCollectionName + '.*');
            const collectionNames = await this.mongoDBConnection.db(databaseName).listCollections({name: {$regex: regEx}}, { nameOnly: true }).toArray();

            const replayCollectionsWithDuration = [];

            for(let i = 0; i < collectionNames.length; i++) {
                const collectionName = collectionNames[i];
                const startTime = collectionName.name.split('_')[0].replace('_', '');
                const durationAndEndtime = await this.getDurationAndEndtime(collectionName.name, startTime);
                const replayCollectionObject = {
                    Name: collectionName.name.replace(replayRecordsCollectionName, ''),
                    StartTime: startTime,
                    EndTime: durationAndEndtime.EndTime,
                    Duration: durationAndEndtime.Duration.milliseconds
                }
                replayCollectionsWithDuration.push(replayCollectionObject);
            }

            return replayCollectionsWithDuration;
        } catch (exception) {
            throw exception;
        }
    }

    async getDurationAndEndtime(replayCollectionName, startTime) {
        try {
            const lastReplayRecordCursor = await this.mongoDBConnection.db(databaseName).collection(replayCollectionName).find({}, {
                projection: {
                    _id: false,
                    Timestamp: true
                }
            }).sort({Timestamp: -1}).limit(1);
            const lastReplayRecord = await lastReplayRecordCursor.next();

            if(lastReplayRecord === null) throw 'collection contains no record';
            const startTimeDateTime = DateTime.fromISO(startTime);
            const endTimeDateTime = DateTime.fromISO(lastReplayRecord.Timestamp);

            return {Duration: endTimeDateTime.diff(startTimeDateTime).toObject(), EndTime: lastReplayRecord.Timestamp};
        } catch (exception) {
            throw exception;
        }
    }

    /**
     * Returns an array of replays for the given replay-name and gameObjectName.
     * @param gameObjectName
     * @param replayName
     */
    async retrieveReplays(gameObjectName, replayName) {
        try {
            const result = this.mongoDBConnection.db(databaseName).collection(replayName + replayRecordsCollectionName).find({GameObjectName: {$eq: gameObjectName}}).sort({Starttime: 1});
            return result.toArray();
        } catch (exception) {
            throw exception;
        }
    }

    async retrieveReplayDetails(replayID) {
        try {
            const findCursor = this.mongoDBConnection.db(databaseName).collection(replayRecordsCollectionName).find({_id: new ObjectId(replayID)});
            return findCursor.next();
        } catch (exception) {
            throw exception;
        }
    }

    async retrieveAllReplays(page = 1, searchString, timestampFilter) {
        try {
            const regEx = new RegExp('.*' + searchString + '.*');
            const timestampSorting = MongoDBHandler.getTimestampSorting(timestampFilter);
            const result = this.mongoDBConnection.db(databaseName).collection(replayRecordsCollectionName).aggregate([
                {
                    $match: {
                        $or: [
                            {
                                GameObjectName: regEx
                            },
                            {
                                Tag: regEx
                            }
                        ]
                    }
                },
                { $skip: (page - 1) * this.pageSize },
                { $limit: this.pageSize },
            ]).sort({Timestamp: timestampSorting});
            return result.toArray();
        } catch (exception) {
            throw exception;
        }
    }

    static getTimestampSorting(timestampFilter) {
        let timestampSorting = 1;
        if(timestampFilter !== undefined && timestampFilter.startsWith('Timestamp (ASC)')) {
            timestampSorting = -1;
        }
        return timestampSorting;
    }

    async getPageMax(searchString) {
        try {
            const regEx = new RegExp('.*' + searchString + '.*');
            const documentsCount = await this.mongoDBConnection.db(databaseName).collection(replayRecordsCollectionName).countDocuments({$or: [
                    {
                        GameObjectName: regEx
                    },
                    {
                        Tag: regEx
                    }
                ]});
            return Math.floor(documentsCount / this.pageSize);
        } catch (exception) {
            throw exception;
        }
    }

    close() {
        this.mongoDBConnection.close();
    }

}

module.exports = new MongoDBHandler();