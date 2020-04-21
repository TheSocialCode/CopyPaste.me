/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import external classes
const Module_FS = require('fs');
const Module_MongoDB = require("mongodb");

// import core module
const CoreModule_Assert = require('assert');
const CoreModule_Util = require('util');


module.exports = {

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
            used: 0,
            archived: 0,
            types: {
                qr: 0,
                manualcode: 0
            }
        },
        transfers: {
            started: 0,
            totalSizeStarted: 0,
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


        if (this._config.mongo)
        {
            // 4. init
            this._mongo = Module_MongoDB.MongoClient;

            // init
            let sMongoURL = 'mongodb://';


            // compose
            if (this._config.mongoauthenticate)
            {
                let sUsername = encodeURIComponent(this._configFile.mongodb.username.toString());
                let sPassword = encodeURIComponent(this._configFile.mongodb.password.toString());

                sMongoURL += sUsername + ':' + sPassword + '@';
            }

            sMongoURL += this._configFile.mongodb.host.toString() + ':' + this._configFile.mongodb.port.toString();
            if (this._config.mongoauthenticate) sMongoURL += '?authMechanism=SCRAM-SHA-1&authSource=' + this._configFile.mongodb.dbname;

            // 6. connect
            this._mongo.connect(sMongoURL, this._onMongoDBConnect.bind(this));
        }

        // // 7. init
        // this._mongo = Module_MongoDB.MongoClient;
        //
        // // 8. configure
        // const sMongoURL = 'mongodb://' + this._configFile.mongodb.host.toString() + ':' + this._configFile.mongodb.port.toString();
        //
        // // 9. connect
        // this._mongo.connect(sMongoURL, this._onMongoDBConnect.bind(this));
    },

    /**
     * Handle MongoDB connect
     * @param err
     * @param client
     * @private
     */
    _onMongoDBConnect: function(err, client)
    {
        // 1. init
        const sMongoDBName = this._configFile.mongodb.dbname.toString();

        // 2. validate
        CoreModule_Assert.equal(null, err);

        // 3. output
        console.log("MongoDB connected on " + this._configFile.mongodb.host.toString() + ':' + this._configFile.mongodb.port.toString());
        console.log();

        // 4. setup
        this._db = client.db(sMongoDBName);

        // 5. store
        this._dbCollection_pairs = this._db.collection('pairs');
        this._dbCollection_stats = this._db.collection('stats');

        // 6. run
        this._timerMonitor = setInterval(this._collectStats.bind(this), 2000);
        this._timerMonitorOutput = setInterval(this._outputStats.bind(this), 1000);
    },

    _collectStats: function()
    {


        this._dbCollection_pairs.countDocuments(function(err, nDocumentCount) {

            // a. validate
            CoreModule_Assert.equal(err, null);

            // b. update
            this._stats.pairs.idle = nDocumentCount - this._stats.pairs.active - this._stats.pairs.archived;

            // c. output
            this._outputStats();

        }.bind(this));

        this._dbCollection_pairs.countDocuments({ "states.active": true }, function(err, nDocumentCount) {

            // a. validate
            CoreModule_Assert.equal(err, null);

            // b. update
            this._stats.pairs.active = nDocumentCount;

            // c. output
            this._outputStats();

        }.bind(this));


        this._dbCollection_pairs.countDocuments({ "states.connected": true }, function(err, nDocumentCount) {

            // a. validate
            CoreModule_Assert.equal(err, null);

            // b. update
            this._stats.pairs.connected = nDocumentCount;

            // c. output
            this._outputStats();

        }.bind(this));

        this._dbCollection_pairs.countDocuments( { "states.used": true }, function(err, nDocumentCount) {

            // a. validate
            CoreModule_Assert.equal(err, null);

            // b. update
            this._stats.pairs.used = nDocumentCount;

            // c. output
            this._outputStats();

        }.bind(this));


        this._dbCollection_pairs.countDocuments( { "states.archived": true }, function(err, nDocumentCount) {

            // a. validate
            CoreModule_Assert.equal(err, null);

            // b. update
            this._stats.pairs.archived = nDocumentCount;

            // c. output
            this._outputStats();

        }.bind(this));


        //db.getSizeOfArray.aggregate({$project:{NumberOfItemsInArray:{$size:"$StudentMarks"}}})

        this._dbCollection_pairs.aggregate(
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

        this._dbCollection_pairs.aggregate(
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





        this._dbCollection_pairs.aggregate(
            [
                { "$unwind": "$logs" },
                { "$match": {"logs.action": "DATA" }},
                {
                    $project: {
                        totalSize: { $sum: "$logs.totalSize" }
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
            this._stats.transfers.totalSizeStarted = nTotalSize;

            // e. update
            this._stats.transfers.totalSizeUnfinished = this._stats.transfers.totalSizeStarted - this._stats.transfers.totalSizeFinished;


        }.bind(this));

        this._dbCollection_pairs.aggregate(
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


        // --- types ----


        // count all data type `PASSWORD`
        this._dbCollection_pairs.aggregate(
            [
                { "$unwind": "$logs" },
                {"$match": {"logs.action": "DATA", "logs.contentType": "password" }}
            ]
        ).toArray(function(err, aDocs) {

            // a. validate
            CoreModule_Assert.equal(err, null);

            // b. update
            this._stats.transfers.types.password = aDocs.length;

        }.bind(this));

        // count all data type `TEXT`
        this._dbCollection_pairs.aggregate(
            [
                { "$unwind": "$logs" },
                {"$match": {"logs.action": "DATA", "logs.contentType": "text" }}
            ]
        ).toArray(function(err, aDocs) {

            // a. validate
            CoreModule_Assert.equal(err, null);

            // b. update
            this._stats.transfers.types.text = aDocs.length;

        }.bind(this));

        // count all data type `PASSWORD`
        this._dbCollection_pairs.aggregate(
            [
                { "$unwind": "$logs" },
                {"$match": {"logs.action": "DATA", "logs.contentType": "document" }}
            ]
        ).toArray(function(err, aDocs) {

            // a. validate
            CoreModule_Assert.equal(err, null);

            // b. update
            this._stats.transfers.types.file = aDocs.length;

        }.bind(this));



        // count all connections type `QR`
        this._dbCollection_pairs.aggregate(
            [
                { "$unwind": "$logs" },
                {"$match": {"logs.action": "SECONDARYDEVICE_CONNECTED_QR" }}
            ]
        ).toArray(function(err, aDocs) {

            // a. validate
            CoreModule_Assert.equal(err, null);

            // b. update
            this._stats.pairs.types.qr = aDocs.length;

        }.bind(this));

        // count all connections type `MANUAL`
        this._dbCollection_pairs.aggregate(
            [
                { "$unwind": "$logs" },
                {"$match": {"logs.action": "SECONDARYDEVICE_CONNECTED_MANUALCODE" }}
            ]
        ).toArray(function(err, aDocs) {

            // a. validate
            CoreModule_Assert.equal(err, null);

            // b. update
            this._stats.pairs.types.manualcode = aDocs.length;

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
