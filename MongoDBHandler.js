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
var _a = require('mongodb'), MongoClient = _a.MongoClient, ServerApiVersion = _a.ServerApiVersion;
require('dotenv').config();
var uri = process.env.MONGODB;
var client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// const { DateTime } = require("luxon");
var MongoDBHandler = /** @class */ (function () {
    function MongoDBHandler() {
        this.mongoDBConnection = null;
        this.pageSize = 20;
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
                        console.log(exception_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @param dbName
     * @param collectionName
     * @param replay
     */
    MongoDBHandler.prototype.addReplay = function (dbName, collectionName, replay) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // replay.timestamp = new DateTime(replay.timestamp);
                    return [2 /*return*/, this.mongoDBConnection.db(dbName).collection(collectionName).insertMany(replay)];
                }
                catch (exception) {
                    console.error(exception);
                    return [2 /*return*/, {}];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Returns an array of replays for the given replay-name.
     * @param dbName
     * @param collectionName
     * @param name
     */
    MongoDBHandler.prototype.retrieveReplays = function (dbName, collectionName, name) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                try {
                    result = this.mongoDBConnection.db(dbName).collection(collectionName).find({ name: { $eq: name } }).sort({ timestamp: 1 });
                    return [2 /*return*/, result.toArray()];
                }
                catch (exception) {
                    console.error(exception);
                    return [2 /*return*/, []];
                }
                return [2 /*return*/];
            });
        });
    };
    MongoDBHandler.prototype.retrieveAllReplays = function (dbName, collectionName, page) {
        if (page === void 0) { page = 1; }
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                try {
                    result = this.mongoDBConnection.db(dbName).collection(collectionName).aggregate([
                        { $match: {} },
                        { $skip: (page - 1) * this.pageSize },
                        { $limit: this.pageSize }
                    ]);
                    return [2 /*return*/, result.toArray()];
                }
                catch (exception) {
                    console.error(exception);
                    return [2 /*return*/, []];
                }
                return [2 /*return*/];
            });
        });
    };
    MongoDBHandler.prototype.getPageMax = function (dbName, collectionName) {
        return __awaiter(this, void 0, void 0, function () {
            var documentsCount, exception_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.mongoDBConnection.db(dbName).collection(collectionName).countDocuments()];
                    case 1:
                        documentsCount = _a.sent();
                        return [2 /*return*/, Math.floor(documentsCount / this.pageSize)];
                    case 2:
                        exception_2 = _a.sent();
                        console.error(exception_2);
                        return [2 /*return*/, 0];
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
