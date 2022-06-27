"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongodb_1 = require("mongodb");
var _a = require('mongodb'), MongoClient = _a.MongoClient, ServerApiVersion = _a.ServerApiVersion;
require('dotenv').config();
var uri = process.env.MONGODB;
var client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
var databaseName = process.env.MONGODBDATABASE;
var replayRecordsCollectionName = process.env.REPLAYCOLLECTIONNAME;
var audioRecordsCollectionName = process.env.AUDIOCOLLECTIONNAME;
var animationRecordsCollectionName = process.env.ANIMATIONCOLLECTIONNAME;
var timelineEventsCollectionName = process.env.TIMELINEEVENTSCOLLECTIONNAME;
var DateTime = require("luxon").DateTime;
var MongoDBHandler = /** @class */ (function () {
    function MongoDBHandler() {
        this.mongoDBConnection = null;
        this.pageSize = 20;
        this.setIndices = false;
        this.setTimelineIndices = false;
        if (this.mongoDBConnection === null || this.mongoDBConnection === undefined) {
            this.createMongoDBConnection();
        }
    }
    MongoDBHandler.prototype.createMongoDBConnection = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, exception_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = this;
                        return [4 /*yield*/, client.connect()];
                    case 1:
                        _a.mongoDBConnection = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        exception_1 = _b.sent();
                        console.error(exception_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MongoDBHandler.prototype.createIndices = function (replayName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    if (this.setIndices)
                        return [2 /*return*/];
                    this.mongoDBConnection.db(databaseName).collection(replayName + replayRecordsCollectionName).createIndex({
                        Timestamp: 1,
                        Name: 1
                    });
                    this.mongoDBConnection.db(databaseName).collection(replayName + audioRecordsCollectionName).createIndex({
                        Timestamp: 1,
                        GameObjectName: 1
                    });
                    this.mongoDBConnection.db(databaseName).collection(replayName + animationRecordsCollectionName).createIndex({
                        Timestamp: 1,
                        GameObjectName: 1
                    });
                    this.setIndices = true;
                }
                catch (exception) {
                    throw exception;
                }
                return [2 /*return*/];
            });
        });
    };
    MongoDBHandler.prototype.createTimelineEventIndizes = function (replayName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    if (this.setTimelineIndices)
                        return [2 /*return*/];
                    this.mongoDBConnection.db(databaseName).collection(replayName + timelineEventsCollectionName).createIndex({
                        Starttime: 1
                    });
                    this.setTimelineIndices = true;
                }
                catch (exception) {
                    throw exception;
                }
                return [2 /*return*/];
            });
        });
    };
    MongoDBHandler.prototype.createTimeLineEvent = function (timelineEvent) {
        return __awaiter(this, void 0, void 0, function () {
            var replayName;
            return __generator(this, function (_a) {
                try {
                    replayName = timelineEvent.ReplayName;
                    if (this.setTimelineIndices) {
                        this.mongoDBConnection.db(databaseName).collection(replayName + timelineEventsCollectionName).dropIndexes(this.mongoDBConnection.db(databaseName).collection(replayName + timelineEventsCollectionName).getIndexes());
                        this.setIndices = false;
                    }
                    return [2 /*return*/, this.mongoDBConnection.db(databaseName).collection(replayName + timelineEventsCollectionName).insertOne(timelineEvent)];
                }
                catch (exception) {
                    throw exception;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * @param replayName
     * @param replayRecords
     */
    MongoDBHandler.prototype.addReplayRecords = function (replayName, replayRecords) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    if (this.setIndices) {
                        this.mongoDBConnection.db(databaseName).collection(replayName + replayRecordsCollectionName).dropIndexes(this.mongoDBConnection.db(databaseName).collection(replayName + replayRecordsCollectionName).getIndexes());
                        this.setIndices = false;
                    }
                    return [2 /*return*/, this.mongoDBConnection.db(databaseName).collection(replayName + replayRecordsCollectionName).insertMany(replayRecords)];
                }
                catch (exception) {
                    throw exception;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * @param ReplayName
     * @param AudioRecords
     */
    MongoDBHandler.prototype.addAudioRecords = function (ReplayName, AudioRecords) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    if (this.setIndices) {
                        this.mongoDBConnection.db(databaseName).collection(ReplayName + audioRecordsCollectionName).dropIndexes(this.mongoDBConnection.db(databaseName).collection(ReplayName + audioRecordsCollectionName).getIndexes());
                        this.setIndices = false;
                    }
                    return [2 /*return*/, this.mongoDBConnection.db(databaseName).collection(ReplayName + audioRecordsCollectionName).insertMany(AudioRecords)];
                }
                catch (exception) {
                    throw exception;
                }
                return [2 /*return*/];
            });
        });
    };
    MongoDBHandler.prototype.addAnimationRecords = function (ReplayName, AnimationRecords) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    if (this.setIndices) {
                        this.mongoDBConnection.db(databaseName).collection(ReplayName + animationRecordsCollectionName).dropIndexes(this.mongoDBConnection.db(databaseName).collection(ReplayName + animationRecordsCollectionName).getIndexes());
                        this.setIndices = false;
                    }
                    return [2 /*return*/, this.mongoDBConnection.db(databaseName).collection(ReplayName + audioRecordsCollectionName).insertMany(AnimationRecords)];
                }
                catch (exception) {
                    throw exception;
                }
                return [2 /*return*/];
            });
        });
    };
    MongoDBHandler.prototype.getReplayRecordsAmount = function (replayName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    return [2 /*return*/, this.mongoDBConnection.db(databaseName).collection(replayName + replayRecordsCollectionName).countDocuments()];
                }
                catch (exception) {
                    throw exception;
                }
                return [2 /*return*/];
            });
        });
    };
    MongoDBHandler.prototype.getReplayRecords = function (replayName) {
        return __awaiter(this, void 0, void 0, function () {
            var exception_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.mongoDBConnection.db(databaseName).collection(replayName + replayRecordsCollectionName).find().sort({ Timestamp: 1 }).toArray()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        exception_2 = _a.sent();
                        throw exception_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MongoDBHandler.prototype.getAudioRecords = function (replayName, gameObjectName) {
        return __awaiter(this, void 0, void 0, function () {
            var exception_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.createIndices(replayName)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.mongoDBConnection.db(databaseName).collection(replayName + audioRecordsCollectionName).find({ GameObjectName: gameObjectName }).sort({ Timestamp: 1 }).toArray()];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        exception_3 = _a.sent();
                        throw exception_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MongoDBHandler.prototype.getAnimationRecords = function (replayName, gameObjectName) {
        return __awaiter(this, void 0, void 0, function () {
            var exception_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.createIndices(replayName)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.mongoDBConnection.db(databaseName).collection(replayName + animationRecordsCollectionName).find({ GameObjectName: gameObjectName }).sort({ Timestamp: 1 }).toArray()];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        exception_4 = _a.sent();
                        throw exception_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MongoDBHandler.prototype.getReplayRecordBatch = function (replayName, batchSize, currentTimelineKnobPosition, name) {
        return __awaiter(this, void 0, void 0, function () {
            var start, starttime, currentStart, currentEnd, exception_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        start = Math.abs(Math.round(currentTimelineKnobPosition - batchSize / 2));
                        starttime = replayName.split('_')[0].replace('_', '');
                        currentStart = DateTime.fromISO(starttime).plus(start);
                        currentEnd = currentStart.plus(batchSize);
                        return [4 /*yield*/, this.createIndices(replayName)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.mongoDBConnection.db(databaseName).collection(replayName + replayRecordsCollectionName).find({
                                Name: name,
                                Timestamp: {
                                    $gte: currentStart.toUTC().toString(),
                                    $lte: currentEnd.toUTC().toString()
                                }
                            }).sort({ Timestamp: 1 }).toArray()];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        exception_5 = _a.sent();
                        throw exception_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MongoDBHandler.prototype.getReplayRecordsForCertainGameObject = function (replayName, name) {
        return __awaiter(this, void 0, void 0, function () {
            var exception_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.createIndices(replayName)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.mongoDBConnection.db(databaseName).collection(replayName + replayRecordsCollectionName).find({ Name: name }).sort({ Timestamp: 1 }).toArray()];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        exception_6 = _a.sent();
                        throw exception_6;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MongoDBHandler.prototype.getTimelineEvents = function (replayName) {
        return __awaiter(this, void 0, void 0, function () {
            var exception_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.createTimelineEventIndizes(replayName)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.mongoDBConnection.db(databaseName).collection(replayName + timelineEventsCollectionName).find().sort({ Starttime: 1 }).toArray()];
                    case 2: return [2 /*return*/, _a.sent()];
                    case 3:
                        exception_7 = _a.sent();
                        throw exception_7;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MongoDBHandler.prototype.getTimelineEventsCount = function (replayName) {
        return __awaiter(this, void 0, void 0, function () {
            var exception_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.mongoDBConnection.db(databaseName).collection(replayName + timelineEventsCollectionName).countDocuments()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        exception_8 = _a.sent();
                        throw exception_8;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MongoDBHandler.prototype.getReplayCollectionObjects = function (userName) {
        return __awaiter(this, void 0, void 0, function () {
            var regEx, collectionNames, replayCollectionsWithDuration, i, collectionName, startTime, durationAndEndtime, replayCollectionObject, exception_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        regEx = new RegExp('.*' + userName + '_records.*');
                        return [4 /*yield*/, this.mongoDBConnection.db(databaseName).listCollections({ name: { $regex: regEx } }, { nameOnly: true }).toArray()];
                    case 1:
                        collectionNames = _a.sent();
                        replayCollectionsWithDuration = [];
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < collectionNames.length)) return [3 /*break*/, 5];
                        collectionName = collectionNames[i];
                        startTime = collectionName.name.split('_')[0].replace('_', '');
                        return [4 /*yield*/, this.getDurationAndEndtime(collectionName.name, startTime)];
                    case 3:
                        durationAndEndtime = _a.sent();
                        replayCollectionObject = {
                            Name: collectionName.name.replace(replayRecordsCollectionName, ''),
                            StartTime: startTime,
                            EndTime: durationAndEndtime.Endtime,
                            Duration: durationAndEndtime.Duration.milliseconds
                        };
                        replayCollectionsWithDuration.push(replayCollectionObject);
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/, replayCollectionsWithDuration];
                    case 6:
                        exception_9 = _a.sent();
                        throw exception_9;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    MongoDBHandler.prototype.getDurationAndEndtime = function (replayCollectionName, startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var lastReplayRecordCursor, lastReplayRecord, startTimeDateTime, endTimeDateTime, exception_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.mongoDBConnection.db(databaseName).collection(replayCollectionName).find({}, {
                                projection: {
                                    _id: false,
                                    Timestamp: true
                                }
                            }).sort({ Timestamp: -1 }).limit(1)];
                    case 1:
                        lastReplayRecordCursor = _a.sent();
                        return [4 /*yield*/, lastReplayRecordCursor.next()];
                    case 2:
                        lastReplayRecord = _a.sent();
                        if (lastReplayRecord === null)
                            throw 'collection contains no record';
                        startTimeDateTime = DateTime.fromISO(startTime);
                        endTimeDateTime = DateTime.fromISO(lastReplayRecord.Timestamp);
                        return [2 /*return*/, { Duration: endTimeDateTime.diff(startTimeDateTime).toObject(), Endtime: lastReplayRecord.Timestamp }];
                    case 3:
                        exception_10 = _a.sent();
                        throw exception_10;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Returns an array of replays for the given replay-name and gameObjectName.
     * @param gameObjectName
     * @param replayName
     */
    MongoDBHandler.prototype.retrieveReplays = function (gameObjectName, replayName) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                try {
                    result = this.mongoDBConnection.db(databaseName).collection(replayName + replayRecordsCollectionName).find({ Name: { $eq: gameObjectName } }).sort({ Starttime: 1 });
                    return [2 /*return*/, result.toArray()];
                }
                catch (exception) {
                    throw exception;
                }
                return [2 /*return*/];
            });
        });
    };
    MongoDBHandler.prototype.retrieveReplayDetails = function (replayID) {
        return __awaiter(this, void 0, void 0, function () {
            var findCursor;
            return __generator(this, function (_a) {
                try {
                    findCursor = this.mongoDBConnection.db(databaseName).collection(replayRecordsCollectionName).find({ _id: new mongodb_1.ObjectId(replayID) });
                    return [2 /*return*/, findCursor.next()];
                }
                catch (exception) {
                    throw exception;
                }
                return [2 /*return*/];
            });
        });
    };
    MongoDBHandler.prototype.retrieveAllReplays = function (page, searchString, timestampFilter) {
        if (page === void 0) { page = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var regEx, timestampSorting, result;
            return __generator(this, function (_a) {
                try {
                    regEx = new RegExp('.*' + searchString + '.*');
                    timestampSorting = MongoDBHandler.getTimestampSorting(timestampFilter);
                    result = this.mongoDBConnection.db(databaseName).collection(replayRecordsCollectionName).aggregate([
                        {
                            $match: {
                                $or: [
                                    {
                                        Name: regEx
                                    },
                                    {
                                        Tag: regEx
                                    }
                                ]
                            }
                        },
                        { $skip: (page - 1) * this.pageSize },
                        { $limit: this.pageSize },
                    ]).sort({ Timestamp: timestampSorting });
                    return [2 /*return*/, result.toArray()];
                }
                catch (exception) {
                    throw exception;
                }
                return [2 /*return*/];
            });
        });
    };
    MongoDBHandler.getTimestampSorting = function (timestampFilter) {
        var timestampSorting = 1;
        if (timestampFilter !== undefined && timestampFilter.startsWith('Timestamp (ASC)')) {
            timestampSorting = -1;
        }
        return timestampSorting;
    };
    MongoDBHandler.prototype.getPageMax = function (searchString) {
        return __awaiter(this, void 0, void 0, function () {
            var regEx, documentsCount, exception_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        regEx = new RegExp('.*' + searchString + '.*');
                        return [4 /*yield*/, this.mongoDBConnection.db(databaseName).collection(replayRecordsCollectionName).countDocuments({ $or: [
                                    {
                                        Name: regEx
                                    },
                                    {
                                        Tag: regEx
                                    }
                                ] })];
                    case 1:
                        documentsCount = _a.sent();
                        return [2 /*return*/, Math.floor(documentsCount / this.pageSize)];
                    case 2:
                        exception_11 = _a.sent();
                        throw exception_11;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    MongoDBHandler.prototype.close = function () {
        this.mongoDBConnection.close();
    };
    return MongoDBHandler;
}());
module.exports = new MongoDBHandler();
