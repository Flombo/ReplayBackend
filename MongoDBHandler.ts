import {ObjectId} from "mongodb";

const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const uri = process.env.MONGODB;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
const databaseName = process.env.MONGODBDATABASE
const collectionName = process.env.MONGODBDATABASE
// const { DateTime } = require("luxon");

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

    public async addReplayHeader(replayHeader) {
        try {
            return this.mongoDBConnection.db(databaseName).collection(collectionName).insert(replayHeader);
        } catch (exception) {
            throw exception;
        }
    }

    /**
     * @param replayRecords
     */
    public async addReplayRecords(replayRecords) {
        try {
            const filter = {replayName: replayRecords.replayName};
            const update = {
                $set: {
                    replayRecords: replayRecords
                }
            };
            return this.mongoDBConnection.db(databaseName).collection(collectionName).update(filter, update);
        } catch (exception) {
            console.error(exception);
            return {};
        }
    }

    /**
     * Returns an array of replays for the given replay-name.
     * @param name
     */
    public async retrieveReplays(name : string) {
        try {
            const result = this.mongoDBConnection.db(databaseName).collection(collectionName).find({name: {$eq: name}}).sort({starttime: 1});
            return result.toArray();
        } catch (exception) {
            console.error(exception);
            return [];
        }
    }

    public async retrieveReplayDetails(replayID : string) {
        try {
            const findCursor = this.mongoDBConnection.db(databaseName).collection(collectionName).find({_id: new ObjectId(replayID)});
            return findCursor.next();
        } catch (exception) {
            console.error(exception);
            throw exception;
        }
    }

    public async retrieveAllReplays(page: number = 1, searchString : string, timestampFilter : string) {
        try {
            const regEx = new RegExp('.*' + searchString + '.*');
            const timestampSorting = MongoDBHandler.getTimestampSorting(timestampFilter);
            const result = this.mongoDBConnection.db(databaseName).collection(collectionName).aggregate([
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
            console.error(exception);
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
            const documentsCount = await this.mongoDBConnection.db(databaseName).collection(collectionName).countDocuments({$or: [
                    {
                        name: regEx
                    },
                    {
                        tag: regEx
                    }
                ]});
            return Math.floor(documentsCount / this.pageSize);
        } catch (exception) {
            console.error(exception);
            throw exception.message;
        }
    }

    public close() {
        this.mongoDBConnection.close();
    }

}

module.exports = new MongoDBHandler();