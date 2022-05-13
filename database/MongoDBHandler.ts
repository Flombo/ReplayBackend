import {ObjectId} from "mongodb";

const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const uri = process.env.MONGODB;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const databaseName = process.env.MONGODBDATABASE
const replayRecordsCollectionName = process.env.REPLAYCOLLECTIONNAME
const timelineEventsCollectionName = process.env.TIMELINEEVENTSCOLLECTIONNAME
const { DateTime } = require("luxon");

class MongoDBHandler {

    private mongoDBConnection = null;
    private pageSize : number = 20;

    constructor() {
        if(this.mongoDBConnection === null || this.mongoDBConnection === undefined) {
            this.createMongoDBConnection();
        }
    }

    private async createMongoDBConnection() {
        try {
            this.mongoDBConnection = await client.connect();
        } catch (exception) {
            console.error(exception);
        }
    }

    public async createTimeLineEvent(timelineEvent) {
        try {
            return this.mongoDBConnection.db(databaseName).collection(timelineEvent.replayName + timelineEventsCollectionName).insertOne(timelineEvent);
        } catch (exception) {
            throw exception;
        }
    }

    /**
     * @param replayRecords
     */
    public async addReplayRecords(replayRecords) {
        try {
            return this.mongoDBConnection.db(databaseName).collection(replayRecords[0].replayName + replayRecordsCollectionName).insertMany(replayRecords);
        } catch (exception) {
            throw exception;
        }
    }

    public async getReplayRecordsAmount(replayName : string) {
        try {
            return this.mongoDBConnection.db(databaseName).collection(replayName + replayRecordsCollectionName).countDocuments();
        } catch (exception) {
            throw exception;
        }
    }

    public async getReplayRecordBatch(replayName : string, batchSize : number, currentTimelineKnobPosition : number) {
        try {
            const start: number = Math.abs(Math.round(currentTimelineKnobPosition - batchSize / 2));

            return await this.mongoDBConnection.db(databaseName).collection(replayName + replayRecordsCollectionName).find().skip(start).limit(Number.parseInt(String(batchSize))).sort({starttime: 1}).toArray();
        } catch (exception) {
            throw exception;
        }
    }

    public async getTimelineEvents(replayName : string) {
        try {
            return this.mongoDBConnection.db(databaseName).collection(replayName + timelineEventsCollectionName).find().sort({starttime: 1});
        } catch (exception) {
            throw exception;
        }
    }

    public async getReplayCollectionObjects(userName : string) {
        try {
            const regEx = new RegExp('.*' + userName + '_records.*');
            const collectionNames = await this.mongoDBConnection.db(databaseName).listCollections({name: {$regex: regEx}}, { nameOnly: true }).toArray();

            const replayCollectionsWithDuration = [];

            for(let i : number = 0; i < collectionNames.length; i++) {
                const collectionName = collectionNames[i];
                const startTime = collectionName.name.split('_')[0].replace('_', '');
                const duration = await this.getDuration(collectionName.name, startTime);
                const replayCollectionObject = {
                    name: collectionName.name,
                    duration: duration.milliseconds
                }
                replayCollectionsWithDuration.push(replayCollectionObject);
            }

            return replayCollectionsWithDuration;
        } catch (exception) {
            throw exception;
        }
    }

    private async getDuration(replayCollectionName : string, startTime : string) {
        try {
            const lastReplayRecordCursor = await this.mongoDBConnection.db(databaseName).collection(replayCollectionName).find({}, {
                projection: {
                    _id: false,
                    timestamp: true
                }
            }).limit(1);
            const lastReplayRecord = await lastReplayRecordCursor.next();

            if(lastReplayRecord === null) throw 'collection contains no record';
            const startTimeDateTime = DateTime.fromISO(startTime);
            const endTimeDateTime = DateTime.fromISO(lastReplayRecord.timestamp);
            return endTimeDateTime.diff(startTimeDateTime).toObject();
        } catch (exception) {
            throw exception;
        }
    }

    /**
     * Returns an array of replays for the given replay-name and gameObjectName.
     * @param gameObjectName
     * @param replayName
     */
    public async retrieveReplays(gameObjectName : string, replayName : string) {
        try {
            const result = this.mongoDBConnection.db(databaseName).collection(replayName + replayRecordsCollectionName).find({name: {$eq: gameObjectName}}).sort({starttime: 1});
            return result.toArray();
        } catch (exception) {
            throw exception;
        }
    }

    public async retrieveReplayDetails(replayID : string) {
        try {
            const findCursor = this.mongoDBConnection.db(databaseName).collection(replayRecordsCollectionName).find({_id: new ObjectId(replayID)});
            return findCursor.next();
        } catch (exception) {
            throw exception;
        }
    }

    public async retrieveAllReplays(page: number = 1, searchString : string, timestampFilter : string) {
        try {
            const regEx = new RegExp('.*' + searchString + '.*');
            const timestampSorting = MongoDBHandler.getTimestampSorting(timestampFilter);
            const result = this.mongoDBConnection.db(databaseName).collection(replayRecordsCollectionName).aggregate([
                {
                    $match: {
                        $or: [
                            {
                                name: regEx
                            },
                            {
                                tag: regEx
                            }
                        ]
                    }
                },
                { $skip: (page - 1) * this.pageSize },
                { $limit: this.pageSize },
            ]).sort({starttime: timestampSorting});
            return result.toArray();
        } catch (exception) {
            throw exception;
        }
    }

    private static getTimestampSorting(timestampFilter : string) : number {
        let timestampSorting = 1;
        if(timestampFilter !== undefined && timestampFilter.startsWith('Timestamp (ASC)')) {
            timestampSorting = -1;
        }
        return timestampSorting;
    }

    public async getPageMax(searchString : string) : Promise<number> {
        try {
            const regEx = new RegExp('.*' + searchString + '.*');
            const documentsCount = await this.mongoDBConnection.db(databaseName).collection(replayRecordsCollectionName).countDocuments({$or: [
                    {
                        name: regEx
                    },
                    {
                        tag: regEx
                    }
                ]});
            return Math.floor(documentsCount / this.pageSize);
        } catch (exception) {
            throw exception;
        }
    }

    public close() {
        this.mongoDBConnection.close();
    }

}

module.exports = new MongoDBHandler();