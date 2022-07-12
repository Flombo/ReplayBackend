import {ObjectId} from "mongodb";

const { MongoClient, ServerApiVersion } = require('mongodb');
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

    private mongoDBConnection = null;
    private pageSize : number = 20;
    private setIndices : boolean = false;
    private setTimelineIndices : boolean = false;

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

    private async createIndices(replayName : string) {
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

    private async createTimelineEventIndizes(replayName : string) {
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

    public async createTimeLineEvent(timelineEvent) {
        try {
            const replayName = timelineEvent.ReplayName;
            if(this.setTimelineIndices) {
                const collection = this.mongoDBConnection.db(databaseName).collection(replayName + timelineEventsCollectionName);
                if(collection !== undefined && collection !== null) {
                    this.mongoDBConnection.db(databaseName).collection(replayName + timelineEventsCollectionName).dropIndexes(
                        this.mongoDBConnection.db(databaseName).collection(replayName + timelineEventsCollectionName).getIndexes()
                    );
                    this.setIndices = false;
                }
            }
            return this.mongoDBConnection.db(databaseName).collection(replayName + timelineEventsCollectionName).insertOne(timelineEvent);
        } catch (exception) {
            throw exception;
        }
    }

    /**
     * @param replayName
     * @param replayRecords
     */
    public async addReplayRecords(replayName : string, replayRecords: []) {
        try {
            if(this.setIndices) {
                const collection = this.mongoDBConnection.db(databaseName).collection(replayName + replayRecordsCollectionName);
                if(collection !== undefined && collection !== null) {
                    this.mongoDBConnection.db(databaseName)
                        .collection(replayName + replayRecordsCollectionName)
                        .dropIndexes(
                            this.mongoDBConnection.db(databaseName).collection(replayName + replayRecordsCollectionName).getIndexes()
                        );
                    this.setIndices = false;
                }
            }
            return this.mongoDBConnection.db(databaseName).collection(replayName + replayRecordsCollectionName).insertMany(replayRecords);
        } catch (exception) {
            throw exception;
        }
    }

    /**
     * @param ReplayName
     * @param AudioRecords
     */
    public async addAudioRecords(ReplayName: any, AudioRecords: []) {
        try {
            if(this.setIndices) {
                this.mongoDBConnection.db(databaseName).collection(ReplayName + audioRecordsCollectionName).dropIndexes(this.mongoDBConnection.db(databaseName).collection(ReplayName + audioRecordsCollectionName).getIndexes());
                this.setIndices = false;
            }
            return this.mongoDBConnection.db(databaseName).collection(ReplayName + audioRecordsCollectionName).insertMany(AudioRecords);
        } catch (exception) {
            throw exception;
        }
    }

    public async addAnimationRecords(ReplayName: any, AnimationRecords: any[]) {
        try {
            if(this.setIndices) {
                this.mongoDBConnection.db(databaseName).collection(ReplayName + animationRecordsCollectionName).dropIndexes(this.mongoDBConnection.db(databaseName).collection(ReplayName + animationRecordsCollectionName).getIndexes());
                this.setIndices = false;
            }
            return this.mongoDBConnection.db(databaseName).collection(ReplayName + audioRecordsCollectionName).insertMany(AnimationRecords);
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

    public async getReplayRecords(replayName : string) {
        try {
            return await this.mongoDBConnection.db(databaseName).collection(replayName + replayRecordsCollectionName).find().sort({Timestamp: 1}).toArray();
        } catch (exception) {
            throw exception;
        }
    }

    public async getAudioRecords(replayName : string, gameObjectName : string) {
        try {
            await this.createIndices(replayName);
            return await this.mongoDBConnection.db(databaseName).collection(replayName + audioRecordsCollectionName).find({GameObjectName : gameObjectName}).sort({Timestamp: 1}).toArray();
        } catch (exception) {
            throw exception;
        }
    }

    public async getAnimationRecords(replayName: any, gameObjectName: any) {
        try {
            await this.createIndices(replayName);
            return await this.mongoDBConnection.db(databaseName).collection(replayName + animationRecordsCollectionName).find({GameObjectName : gameObjectName}).sort({Timestamp: 1}).toArray();
        } catch (exception) {
            throw exception;
        }
    }

    public async getReplayRecordBatch(replayName : string, batchSize : number, currentTimelineKnobPosition : number, name : string) {
        try {
            const start: number = Math.abs(Math.round(currentTimelineKnobPosition - batchSize / 2));
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

    public async getReplayRecordsForCertainGameObject(replayName : string, name : string) {
        try {
            await this.createIndices(replayName);
            return await this.mongoDBConnection.db(databaseName).collection(replayName + replayRecordsCollectionName).find({GameObjectName : name}).sort({Timestamp: 1}).toArray();
        } catch (exception) {
            throw exception;
        }
    }

    public async getTimelineEvents(replayName : string) {
        try {
            await this.createTimelineEventIndizes(replayName);
            return await this.mongoDBConnection.db(databaseName).collection(replayName + timelineEventsCollectionName).find().sort({Starttime: 1}).toArray();
        } catch (exception) {
            throw exception;
        }
    }

    public async getTimelineEventsCount(replayName : string) {
        try {
            return await this.mongoDBConnection.db(databaseName).collection(replayName + timelineEventsCollectionName).countDocuments();
        } catch (exception) {
            throw exception;
        }
    }

    public async getReplayCollectionObjects(userName : string) {
        try {
            const regEx = new RegExp('.*' + userName + replayRecordsCollectionName + '.*');
            const collectionNames = await this.mongoDBConnection.db(databaseName).listCollections({name: {$regex: regEx}}, { nameOnly: true }).toArray();

            const replayCollectionsWithDuration = [];

            for(let i : number = 0; i < collectionNames.length; i++) {
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

    private async getDurationAndEndtime(replayCollectionName : string, startTime : string) {
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
    public async retrieveReplays(gameObjectName : string, replayName : string) {
        try {
            const result = this.mongoDBConnection.db(databaseName).collection(replayName + replayRecordsCollectionName).find({GameObjectName: {$eq: gameObjectName}}).sort({Starttime: 1});
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

    public close() {
        this.mongoDBConnection.close();
    }

}

module.exports = new MongoDBHandler();