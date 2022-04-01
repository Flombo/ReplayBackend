const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const uri = process.env.MONGODB;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
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
            console.log(exception);
        }
    }

    /**
     * @param dbName
     * @param collectionName
     * @param replay
     */
    public async addReplay(dbName : string, collectionName : string, replay) {
        try {
            // replay.timestamp = new DateTime(replay.timestamp);
            return this.mongoDBConnection.db(dbName).collection(collectionName).insertMany(replay);
        } catch (exception) {
            console.error(exception);
            return {};
        }
    }

    /**
     * Returns an array of replays for the given replay-name.
     * @param dbName
     * @param collectionName
     * @param name
     */
    public async retrieveReplays(dbName : string, collectionName : string, name : string) {
        try {
            const result = this.mongoDBConnection.db(dbName).collection(collectionName).find({name: {$eq: name}}).sort({timestamp: 1});
            return result.toArray();
        } catch (exception) {
            console.error(exception);
            return [];
        }
    }

    public async retrieveAllReplays(dbName : string, collectionName :  string, page: number = 1) {
        try {
            const result = this.mongoDBConnection.db(dbName).collection(collectionName).aggregate([
                { $match: {} },
                { $skip: (page - 1) * this.pageSize },
                { $limit: this.pageSize }
            ]);
            return result.toArray();
        } catch (exception) {
            console.error(exception);
            return [];
        }
    }

    public async getPageMax(dbName : string, collectionName : string) : Promise<number> {
        try {
            const documentsCount = await this.mongoDBConnection.db(dbName).collection(collectionName).countDocuments();
            return Math.floor(documentsCount / this.pageSize);
        } catch (exception) {
            console.error(exception);
            return 0;
        }
    }

    public close() {
        this.mongoDBConnection.close();
    }

}

module.exports = new MongoDBHandler();