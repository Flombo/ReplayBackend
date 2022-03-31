const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const uri = process.env.MONGODB;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// const { DateTime } = require("luxon");

class MongoDBHandler {

    private mongoDBConnection = null;

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
            console.log(exception);
            return {};
        }
    }

    public async retrieveReplays(dbName : string, collectionName : string, name : string) : Promise<string> {
        try {
            const result = this.mongoDBConnection.db(dbName).collection(collectionName).find({name: {$eq: name}}).sort({timestamp: 1});
            return result.toArray();
        } catch (exception) {
            console.log(exception);
            return '[]';
        }
    }

    public close() {
        this.mongoDBConnection.close();
    }

}

module.exports = new MongoDBHandler();