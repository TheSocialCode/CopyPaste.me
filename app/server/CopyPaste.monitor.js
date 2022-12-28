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
const Utils = require("./utils/Utils");


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
            //averageTimeTillConnection: 0,
            used: 0,
            archived: 0
        },
        // transfers: {
        //     started: 0,
        //     totalSizeStarted: 0,
        //     totalSizeTransferred: 0,
        //     finished: 0,
        //     totalSizeFinished: 0,
        //     unfinished: 0,
        //     totalSizeUnfinished: 0,
        //     types: {
        //         password: 0,
        //         text: 0,
        //         file: 0
        //     }
        // }
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
            ' ',
            ' ',
            '*** MONITOR (MINIMAL STATS) ***',
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
        //console.log(this._sIntro);

        
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
        this.Mimoto.mongoDB = new MongoDB(this._configFile, this._config, ['pairs', 'transfers', 'stats', 'exceptions']);

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
        // 1. cleanup
        console.clear();
        console.log(this._sIntro + '\n\n' + new Date().toString() +'\n\n');

        // 2. run
        // this._timerMonitor = setInterval(this._collectStats.bind(this), 5 * 1000);
        // this._timerMonitorOutput = setInterval(this._outputStats.bind(this), 2 * 1000);


        this._collectStats();
    },

    _collectStats: function()
    {

        // 1. add timestamps
        // 2. cleanup (and analyse) archived pairs older than x
        // 3. run every x minutes

        // 11. live stats for pairs
        // 12. show current number of connections
        // 13. refresh every x minutes
        // 15. how to handle dropped moments?

        // B. timestamps allows `less than` queries, group ids don't



        // --- Done
        // 4. analyzer script
        // 5. monitor script shows

        // --- Alternative, more obfuscating
        // A. group creation in second phase, start with timestamps
        // 6. server creates random unique group id
        // 7. store all items in group id  (how to keep server and analyzer in sync)
        // 8. analyse and cleanup group id
        // 9. close group + add new group
        // 10. cleanup closed groups

        // --- Later
        // 14. push to interface



        if (this.Mimoto.mongoDB.isRunning()) this.Mimoto.mongoDB.getCollection('stats').find(
            // {
            //     //"date": { $gt: , $lt: }
            // }
            // {created: {$regex: '^2022.08.06 00:06'}}
        ).toArray(function(err, aDocs) {

            // a. validate
            CoreModule_Assert.equal(err, null);


            // 1. cleanup
            console.clear();
            console.log(this._sIntro + '\n\n' + new Date().toString() +'\n\n');

            // console.log(this._stats);



            // let stats = {
            //     type: 'pairs',
            //     created: Utils.prototype.buildDate(),
            //     active: result.activeCount,
            //     idle: result.pairCount - result.activeCount - result.archivedCount,
            //     connected: result.connectedCount,
            //     connectionTypes: {
            //         scan: result.connectionTypeScan,
            //         manually: result.connectionTypeManually,
            //         invite: result.connectionTypeInvite
            //     },
            //     used: result.usedCount,
            //     archived: result.archivedCount
            // };
            //
            // console.clear();
            // console.log(this._sIntro + '\n\n' + new Date().toString() +'\n\n');
            // console.log(stats);
            //
            // // d. store
            // if (this.Mimoto.mongoDB.isRunning()) this.Mimoto.mongoDB.getCollection('stats').insertOne(
            //     stats
            // );


            // console.log('Yay!', aDocs);



            // get first in collection
            // for (let s in aDocs) { console.log('created =', aDocs[s].created); return; }


            let nTotal = 0;

            let nStartValue = 0;
            let nEndValue = 0;
            let nLastValue = 0;
            let sCurrentPeriod = null;


            // let addZeros = function(sValue, nLength = null)
            // {
            //     // convert
            //     sValue = '' + sValue;
            //     if (nLength === null) nLength = sValue.length;
            //
            //     // complete
            //     while (sValue.length < nLength) sValue += '0' + sValue;
            // }


            for (let sKey in aDocs)
            {
                let sYear = aDocs[sKey].created.substring(0, 4);
                let sMonth = aDocs[sKey].created.substring(5, 7);
                let sDaily = aDocs[sKey].created.substring(8, 10);

                // console.log('aDocs[sKey].created =', aDocs[sKey].created, 'sYear =', sYear, 'sMonth =', sMonth);



                nEndValue = aDocs[sKey].used - nStartValue;


                if (sCurrentPeriod !== aDocs[sKey].created.substring(0, 7)) // monthly
                // if (sCurrentPeriod !== aDocs[sKey].created.substring(0, 10)) // daily
                {
                    nTotal += nEndValue;

                    // console.log(sCurrentPeriod);
                    // console.log(nEndValue);
                    console.log(sCurrentPeriod, '=', nEndValue);

                    sCurrentPeriod = sYear + '.' + sMonth; // monthly
                    // sCurrentPeriod = sYear + '.' + sMonth + '.' + sDaily; // daily


                    nStartValue = aDocs[sKey].used;
                }

                nLastValue = aDocs[sKey].used;
            }


            nTotal += nEndValue;
            console.log(sCurrentPeriod, '=', nEndValue);

            console.log('');
            console.log('Total =', nTotal);







        }.bind(this));





        //this._outputStats();
    },

    // _outputStats: function()
    // {
    //     //return;
    //     // 1. cleanup
    //     console.clear();
    //     console.log(this._sIntro + '\n\n' + new Date().toString() +'\n\n');
    //
    //     console.log(this._stats);
    // }

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
