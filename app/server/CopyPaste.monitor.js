/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import project classes
const MongoDB = require('./components/MongoDB');
const ConnectionTypes = require('./../client/components/Connector/ConnectionTypes');

// import external classes
const Module_FS = require('fs');
const Module_MongoDB = require("mongodb");

// import core module
const CoreModule_Assert = require('assert');
const CoreModule_Util = require('util');


module.exports = {

    // core
    Mimoto: {},
    
    // config
    _config: {
        mongo: true,
        mongoauthenticate: true
    },
    _configFile: null,

    // services
    _mongo: null,

    // database
    _db: null,
    _dbCollection_pairs: null,
    _dbCollection_stats: null,

    // utils
    _timerMonitor: null,
    _timerMonitorOutput: null,

    // data
    _sIntro: '',
    _stats: {
        pairs: {
            active: 0,
            idle: 0,
            connected: 0,
            connectionTypes: {
                scan: 0,
                manually: 0,
                invite: 0
            },
            averageTimeTillConnection: 0,
            used: 0,
            archived: 0
        },
        transfers: {
            started: 0,
            totalSizeStarted: 0,
            totalSizeTransferred: 0,
            finished: 0,
            totalSizeFinished: 0,
            unfinished: 0,
            totalSizeUnfinished: 0,
            types: {
                password: 0,
                text: 0,
                file: 0
            }
        }
    },



    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function(config)
    {
        // 1. store
        if (config.mode && config.mode === 'prod' || config.mode === 'dev') this._config.mode = config.mode;
        if (config.https === true || config.https === false) this._config.https = config.https;
        if (config.mongo === true || config.mongo === false) this._config.mongo = config.mongo;
        if (config.mongoauthenticate === true || config.mongoauthenticate === false) this._config.mongoauthenticate = config.mongoauthenticate;


        // 1. load
        let jsonConfigFile = Module_FS.readFileSync('CopyPaste.config.json');

        // 2. convert
        this._configFile = JSON.parse(jsonConfigFile);


        // --- setup introduction


        // 3. prepare
        let aLines = [
            '',
            'CopyPaste.me - Frictionless sharing between devices',
            'Created by The Social Code',
            ' ',
            '@author  Sebastian Kersten',
            ' ',
            'Please help keeping this service free by donating: https://paypal.me/thesocialcode',
            ' ',
            'MongoDB connected on ' + this._configFile.mongodb.host.toString() + ':' + this._configFile.mongodb.port.toString(),
            ''
        ];

        // 4. find max length
        let nMaxLength = 0;
        for (let nLineIndex = 0; nLineIndex < aLines.length; nLineIndex++)
        {
            // a. calculate
            if (aLines[nLineIndex].length > nMaxLength) nMaxLength = aLines[nLineIndex].length;
        }

        // 5. build and output lines
        for (let nLineIndex = 0; nLineIndex < aLines.length; nLineIndex++)
        {
            // a. build
            if (aLines[nLineIndex].length === 0)
            {
                while(aLines[nLineIndex].length < nMaxLength) aLines[nLineIndex] += '-';
                aLines[nLineIndex] = '----' + aLines[nLineIndex] + '----';
            }
            else
            {
                while(aLines[nLineIndex].length < nMaxLength) aLines[nLineIndex] += ' ';
                aLines[nLineIndex] = '--- ' + aLines[nLineIndex] + ' ---';
            }

            // b. output
            this._sIntro += aLines[nLineIndex] + '\n';
        }

        // 6. output extra line
        this._sIntro += '\n';

        
        // --- Mongo DB
        
        
        // 7. boot up
        if (!this._startupMongoDB()) this._startupSocketIO();
    },

    /**
     * Startup MongoDB
     * @private
     */
    _startupMongoDB: function()
    {
        // 1. init
        this.Mimoto.mongoDB = new MongoDB(this._configFile, this._config);

        // 2. verify and exit
        if (!this._config.mongo) return false;

        // 3. configure
        this.Mimoto.mongoDB.addEventListener(MongoDB.prototype.MONGODB_READY, this._onMongoDBReady.bind(this));

        // 4. exit
        return true
    },
    
    /**
     * Handle MongoDB ready
     * @param err
     * @param client
     * @private
     */
    _onMongoDBReady: function(err, client)
    {
        // 1. run
        this._timerMonitor = setInterval(this._collectStats.bind(this), 2000);
        this._timerMonitorOutput = setInterval(this._outputStats.bind(this), 1000);
    },

    _collectStats: function()
    {


        if (this.Mimoto.mongoDB.isRunning()) this.Mimoto.mongoDB.getCollection('pairs').aggregate(
            [
                // {"$project": {"logs":1}},
                { "$unwind": "$logs" },
                //{"$group": {"_id":{"logs":"$logs"}, "count":{"$sum":1}}},
                {"$match": {"logs.action": "DATA" }},
                // {"$group": {"_id": "$_id._id", "logs":{"$addToSet":"$_id.logs"}}}
            ]
        ).toArray(function(err, aDocs) {

            // a. validate
            CoreModule_Assert.equal(err, null);

            // b. update
            this._stats.transfers.started = aDocs.length;

            // c. update
            this._stats.transfers.unfinished = this._stats.transfers.started - this._stats.transfers.finished;

            // d. output
            this._outputStats();

        }.bind(this));

        if (this.Mimoto.mongoDB.isRunning()) this.Mimoto.mongoDB.getCollection('pairs').aggregate(
            [
                // {"$project": {"logs":1}},
                { "$unwind": "$logs" },
                //{"$group": {"_id":{"logs":"$logs"}, "count":{"$sum":1}}},
                {"$match": {"logs.action": "DATA", "logs.finished": true }},
                // {"$group": {"_id": "$_id._id", "logs":{"$addToSet":"$_id.logs"}}}
            ]
        ).toArray(function(err, aDocs) {

            // a. validate
            CoreModule_Assert.equal(err, null);

            // b. update
            this._stats.transfers.finished = aDocs.length;

        }.bind(this));





        if (this.Mimoto.mongoDB.isRunning()) this.Mimoto.mongoDB.getCollection('pairs').aggregate(
            [
                { "$unwind": "$logs" },
                { "$match": {"logs.action": "DATA" }},
                {
                    $project: {
                        totalSize: { $sum: "$logs.totalSize" },
                        totalTransferred: { $sum: "$logs.bytesTransferred" }
                    }
                }

                // {"$group": {"_id": "$_id._id", "logs":{"$addToSet":"$_id.logs"}}}
            ]
        ).toArray(function(err, aDocs) {

            // a. validate
            CoreModule_Assert.equal(err, null);

            // b. init
            let nTotalSize = 0;
            let nTotalTransferred = 0;

            // c. add up
            let nItemCount = aDocs.length;
            for (let nItemIndex = 0; nItemIndex < nItemCount; nItemIndex++)
            {
                nTotalSize += aDocs[nItemIndex].totalSize;
                nTotalTransferred += aDocs[nItemIndex].totalTransferred;
            }

            // d. update
            this._stats.transfers.totalSizeStarted = nTotalSize;
            this._stats.transfers.totalSizeTransferred = nTotalTransferred;

            // e. update
            this._stats.transfers.totalSizeUnfinished = this._stats.transfers.totalSizeStarted - this._stats.transfers.totalSizeTransferred;


        }.bind(this));

        if (this.Mimoto.mongoDB.isRunning()) this.Mimoto.mongoDB.getCollection('pairs').aggregate(
            [
                { "$unwind": "$logs" },
                { "$match": {"logs.action": "DATA", "logs.finished": true }},


                // db.getCollection('collectionName').aggregate(
                //     [ {$group : { _id : '$user', count : {$sum : 1}}} ]
                // )


                // {
                //     "$group":
                //     {
                //         _id: { id:"$id", logs:"$logs" },
                //         //sizes: { $push:  { totalSize: "$logs.totalSize" } }
                //         totalSize: { $sum: "logs.totalSize" }, //{ $multiply: [ "$price", "$quantity" ] } },
                //         //count: { $sum: 1 }
                //     }
                // },
                {
                    $project: {
                        totalSize: { $sum: "$logs.totalSize" },
                    }
                }

                // {"$group": {"_id": "$_id._id", "logs":{"$addToSet":"$_id.logs"}}}
            ]
        ).toArray(function(err, aDocs) {

            // a. validate
            CoreModule_Assert.equal(err, null);

            // b. init
            let nTotalSize = 0;

            // c. add up
            let nItemCount = aDocs.length;
            for (let nItemIndex = 0; nItemIndex < nItemCount; nItemIndex++)
            {
                nTotalSize += aDocs[nItemIndex].totalSize;
            }

            // d. update
            this._stats.transfers.totalSizeFinished = nTotalSize;

        }.bind(this));





        // ---------------------------------------------------




        if (this.Mimoto.mongoDB.isRunning()) this.Mimoto.mongoDB.getCollection('pairs').aggregate(
            [
                {
                    $unwind: "$logs"
                },
                {
                    $match: {
                        "logs.action": "DATA"
                    }
                },
                {
                    $group: {
                        _id: null,
                        numberOfTransfers: { $sum: 1 },
                        totalSize: { $sum: "$logs.totalSize" }
                    }
                },
                {
                    $project: {
                        _id: false,
                        numberOfTransfers : true,
                        totalSize : true
                    }
                }
            ]
        ).toArray(function(err, aDocs) {

            // a. validate
            CoreModule_Assert.equal(err, null);

            // b. update
            this._stats.xxx = JSON.stringify(aDocs);

        }.bind(this));



        if (this.Mimoto.mongoDB.isRunning()) this.Mimoto.mongoDB.getCollection('pairs').aggregate(
            [
                {
                    $unwind: "$logs"
                },
                {
                    $match: {
                        "logs.action": "DATA"
                    }
                },
                {
                    $group: {
                        _id: null,
                        numberOfTransfers: { $sum: 1 },
                        totalSize: { $sum: "$logs.totalSize" }
                    }
                },
                {
                    $project: {
                        _id: false,
                        numberOfTransfers : true,
                        totalSize : true
                    }
                }
            ]
        ).toArray(function(err, aDocs) {

            // a. validate
            CoreModule_Assert.equal(err, null);

            // b. update
            this._stats.xxx = JSON.stringify(aDocs);

        }.bind(this));



        // ---------------------------------------------------





        // ---------------------------------------------------




        if (this.Mimoto.mongoDB.isRunning()) this.Mimoto.mongoDB.getCollection('pairs').aggregate(
            [
                {
                    "$group": {
                        "_id": false,
                        "pairCount": { $sum: 1 },
                        "activeCount": { $sum: { $cond: [ { $eq: [ "$active", true ] }, 1, 0 ] } },
                        "connectedCount": { $sum: { $cond: [ { $eq: [ "$connected", true ] }, 1, 0 ] } },
                        "connectionTypeScan": { $sum: { $cond: [ { $eq: [ "$connectionType", ConnectionTypes.prototype.TYPE_SCAN ] }, 1, 0 ] } },
                        "connectionTypeManually": { $sum: { $cond: [ { $eq: [ "$connectionType", ConnectionTypes.prototype.TYPE_MANUALLY ] }, 1, 0 ] } },
                        "connectionTypeInvite": { $sum: { $cond: [ { $eq: [ "$connectionType", ConnectionTypes.prototype.TYPE_INVITE ] }, 1, 0 ] } },
                        "usedCount": { $sum: { $cond: [ { $eq: [ "$used", true ] }, 1, 0 ] } },
                        "archivedCount": { $sum: { $cond: [ { $eq: [ "$archived", true ] }, 1, 0 ] } }
                    }
                },
                {
                    "$project": {
                        "_id": 0
                    }
                }
            ]
        ).toArray(function(err, aDocs) {

            // a. validate
            CoreModule_Assert.equal(err, null);

            // b. store
            let result = aDocs[0];

            // c. validate
            if (!result) return;

            // d. update
            this._stats.pairs.active = result.activeCount;
            this._stats.pairs.idle = result.pairCount - result.activeCount - result.archivedCount;
            this._stats.pairs.connected = result.connectedCount;
            this._stats.pairs.connectionTypes.scan = result.connectionTypeScan;
            this._stats.pairs.connectionTypes.manually = result.connectionTypeManually;
            this._stats.pairs.connectionTypes.invite = result.connectionTypeInvite;
            this._stats.pairs.used = result.usedCount;
            this._stats.pairs.archived = result.archivedCount;

        }.bind(this));



        // --- data ------------------------------------------------


        if (this.Mimoto.mongoDB.isRunning()) this.Mimoto.mongoDB.getCollection('pairs').aggregate(
            [
                {
                    $unwind: "$logs"
                },
                {
                    $match: {
                        "logs.action": "DATA"
                    }
                },
                {
                    "$group": {
                        "_id": false,
                        "typePasswordCount": { $sum: { $cond: [ { $eq: [ "$logs.contentType", "password" ] }, 1, 0 ] } },
                        "typeTextCount": { $sum: { $cond: [ { $eq: [ "$logs.contentType", "text" ] }, 1, 0 ] } },
                        "typeFileCount": { $sum: { $cond: [ { $eq: [ "$logs.contentType", "file" ] }, 1, 0 ] } },
                    }
                },
                {
                    "$project": {
                        "_id": 0
                    }
                }
            ]
        ).toArray(function(err, aDocs) {

            // a. validate
            CoreModule_Assert.equal(err, null);

            // b. store
            let result = aDocs[0];

            // c. validate
            if (!result) return;

            // d. update
            this._stats.transfers.types.password = result.typePasswordCount;
            this._stats.transfers.types.text = result.typeTextCount;
            this._stats.transfers.types.file = result.typeFileCount;

        }.bind(this));


        // if (this.Mimoto.mongoDB.isRunning()) this.Mimoto.mongoDB.getCollection('pairs').find(
        //     {
        //         "logs.action": "DATA",
        //         "archived": true
        //     }
        // ).toArray(function(err, aDocs) {
        //
        //     // a. validate
        //     CoreModule_Assert.equal(err, null);
        //
        //
        //     console.log('Yay!', aDocs);
        //
        //     // process.exit(22);
        //     // return;
        //
        //
        //     var bulkArray = [];
        //     aDocs.forEach(
        //         function(d, i)
        //         {
        //
        //             //this._stats.currently_x = 'xxx';
        //
        //             bulkArray.push(
        //                 {
        //                     updateOne: {
        //                         filter: { _id: d._id },
        //                         update: { $set: { marked: 'xxx' }},
        //                         upsert:true
        //                     }
        //                 }
        //             );
        //         }
        //         );
        //     if (this.Mimoto.mongoDB.isRunning()) this.Mimoto.mongoDB.getCollection('pairs').bulkWrite(bulkArray, {ordered:true, w:1});
        //
        // }.bind(this));



        // --- mark

        // if (this.Mimoto.mongoDB.isRunning()) this.Mimoto.mongoDB.getCollection('pairs').find(
        //     {
        //         "logs.action": "DATA",
        //         "archived": true
        //     }
        // ).toArray(function(err, aDocs) {





        // --- duration ------------------------------------------------


        if (this.Mimoto.mongoDB.isRunning()) this.Mimoto.mongoDB.getCollection('pairs').aggregate(
            [
                {
                    $unwind: "$logs"
                },
                {
                    $match: {
                        "logs.action": "DEVICES_CONNECTED"
                    }
                },
                {
                    "$group": {
                        "_id": false,
                        "averageTimeTillConnection": { $avg: "$logs.timeSinceStart"}
                    }
                },
                {
                    "$project": {
                        "_id": 0,
                        "averageTimeTillConnection": { $round: "$averageTimeTillConnection" }
                    }
                }
            ]
        ).toArray(function(err, aDocs) {

            // a. validate
            CoreModule_Assert.equal(err, null);

            // b. store
            let result = aDocs[0];

            // c. validate
            if (!result) return;

            // d. update
            this._stats.pairs.averageTimeTillConnection = result.averageTimeTillConnection;

        }.bind(this));





        this._outputStats();
    },

    _outputStats: function()
    {
        //return;
        // 1. cleanup
        console.clear();
        console.log(this._sIntro + '\n\n' + new Date().toString() +'\n\n');

        console.log(this._stats);
    }

};

// init
this.Mimoto = {};
this.Mimoto.config = {};

// read
process.argv.forEach((value, index) => {
    if (value.substr(0, 18) === 'mongoauthenticate=')
    {
        this.Mimoto.config.mongoauthenticate = (value.substr(18) === 'false') ? false : true;
    }
});

// auto-start
module.exports.__construct(this.Mimoto.config);
