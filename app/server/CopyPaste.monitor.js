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
    _configFile: null,

    // services
    _mongo: null,

    // database
    _db: null,
    _dbCollection_sockets: null,
    _dbCollection_pairs: null,
    _dbCollection_manualcodes: null,

    // utils
    _timerMonitor: null,

    // helpers
    _sIntro: '',
    _aDailyTimeSlots: [],
    _aHourTimeSlots: [],
    _aDailyValuesPairs: [0, 0, 0, 0, 0, 0, 0],
    _aHourlyValuesPairs: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    _aDailyValuesPairsConnected: [0, 0, 0, 0, 0, 0, 0],
    _aHourlyValuesPairsConnected: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    _aDailyValuesPairsUsed: [0, 0, 0, 0, 0, 0, 0],
    _aHourlyValuesPairsUsed: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],



    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function()
    {
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
            '@license AGPL-3.0-only',
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


        // 7. init
        this._mongo = Module_MongoDB.MongoClient;

        // 8. configure
        const sMongoURL = 'mongodb://' + this._configFile.mongodb.host.toString() + ':' + this._configFile.mongodb.port.toString();

        // 9. connect
        this._mongo.connect(sMongoURL, this._onMongoDBConnect.bind(this));
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
        this._dbCollection_sockets = this._db.collection('sockets');
        this._dbCollection_pairs = this._db.collection('pairs');
        this._dbCollection_manualcodes = this._db.collection('manualcodes');

        // 6. run
        this._timerMonitor = setInterval(this._readCollections.bind(this), 5000);
    },

    _setupOutput: function()
    {
        // init
        const today = new Date();
        let startOfTheDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const nDay = 1000 * 60 * 60 * 24;
        const nHour = 1000 * 60 * 60;

        this._aDailyTimeSlots = [
            { sLabel: '6 days ago', nStart: startOfTheDay.getTime() - (nDay * 6), nEnd: startOfTheDay.getTime() + (nDay * -5) },
            { sLabel: '5 days ago', nStart: startOfTheDay.getTime() - (nDay * 5), nEnd: startOfTheDay.getTime() + (nDay * -4) },
            { sLabel: '4 days ago', nStart: startOfTheDay.getTime() - (nDay * 4), nEnd: startOfTheDay.getTime() + (nDay * -3) },
            { sLabel: '3 days ago', nStart: startOfTheDay.getTime() - (nDay * 3), nEnd: startOfTheDay.getTime() + (nDay * -2) },
            { sLabel: '2 days ago', nStart: startOfTheDay.getTime() - (nDay * 2), nEnd: startOfTheDay.getTime() + (nDay * -1) },
            { sLabel: 'yesterday', nStart: startOfTheDay.getTime() - (nDay * 1), nEnd: startOfTheDay.getTime() + (nDay * 0) },
            { sLabel: 'today', nStart: startOfTheDay.getTime() - (nDay * 0), nEnd: startOfTheDay.getTime() + (nDay * 1) }
        ];

        this._aHourTimeSlots = [
            { sLabel: '00', nStart: startOfTheDay.getTime() + (nHour * 0), nEnd: startOfTheDay.getTime() + (nHour * 1), value: 0 },
            { sLabel: '01', nStart: startOfTheDay.getTime() + (nHour * 1), nEnd: startOfTheDay.getTime() + (nHour * 2), value: 0 },
            { sLabel: '02', nStart: startOfTheDay.getTime() + (nHour * 2), nEnd: startOfTheDay.getTime() + (nHour * 3), value: 0 },
            { sLabel: '03', nStart: startOfTheDay.getTime() + (nHour * 3), nEnd: startOfTheDay.getTime() + (nHour * 4), value: 0 },
            { sLabel: '04', nStart: startOfTheDay.getTime() + (nHour * 4), nEnd: startOfTheDay.getTime() + (nHour * 5), value: 0 },
            { sLabel: '05', nStart: startOfTheDay.getTime() + (nHour * 5), nEnd: startOfTheDay.getTime() + (nHour * 6), value: 0 },
            { sLabel: '06', nStart: startOfTheDay.getTime() + (nHour * 6), nEnd: startOfTheDay.getTime() + (nHour * 7), value: 0 },
            { sLabel: '07', nStart: startOfTheDay.getTime() + (nHour * 7), nEnd: startOfTheDay.getTime() + (nHour * 8), value: 0 },
            { sLabel: '08', nStart: startOfTheDay.getTime() + (nHour * 8), nEnd: startOfTheDay.getTime() + (nHour * 9), value: 0 },
            { sLabel: '09', nStart: startOfTheDay.getTime() + (nHour * 9), nEnd: startOfTheDay.getTime() + (nHour * 10), value: 0 },
            { sLabel: '10', nStart: startOfTheDay.getTime() + (nHour * 10), nEnd: startOfTheDay.getTime() + (nHour * 11), value: 0 },
            { sLabel: '11', nStart: startOfTheDay.getTime() + (nHour * 11), nEnd: startOfTheDay.getTime() + (nHour * 12), value: 0 },
            { sLabel: '12', nStart: startOfTheDay.getTime() + (nHour * 12), nEnd: startOfTheDay.getTime() + (nHour * 13), value: 0 },
            { sLabel: '13', nStart: startOfTheDay.getTime() + (nHour * 13), nEnd: startOfTheDay.getTime() + (nHour * 14), value: 0 },
            { sLabel: '14', nStart: startOfTheDay.getTime() + (nHour * 14), nEnd: startOfTheDay.getTime() + (nHour * 15), value: 0 },
            { sLabel: '15', nStart: startOfTheDay.getTime() + (nHour * 15), nEnd: startOfTheDay.getTime() + (nHour * 16), value: 0 },
            { sLabel: '16', nStart: startOfTheDay.getTime() + (nHour * 16), nEnd: startOfTheDay.getTime() + (nHour * 17), value: 0 },
            { sLabel: '17', nStart: startOfTheDay.getTime() + (nHour * 17), nEnd: startOfTheDay.getTime() + (nHour * 18), value: 0 },
            { sLabel: '18', nStart: startOfTheDay.getTime() + (nHour * 18), nEnd: startOfTheDay.getTime() + (nHour * 19), value: 0 },
            { sLabel: '19', nStart: startOfTheDay.getTime() + (nHour * 19), nEnd: startOfTheDay.getTime() + (nHour * 20), value: 0 },
            { sLabel: '20', nStart: startOfTheDay.getTime() + (nHour * 20), nEnd: startOfTheDay.getTime() + (nHour * 21), value: 0 },
            { sLabel: '21', nStart: startOfTheDay.getTime() + (nHour * 21), nEnd: startOfTheDay.getTime() + (nHour * 22), value: 0 },
            { sLabel: '22', nStart: startOfTheDay.getTime() + (nHour * 22), nEnd: startOfTheDay.getTime() + (nHour * 23), value: 0 },
            { sLabel: '23', nStart: startOfTheDay.getTime() + (nHour * 23), nEnd: startOfTheDay.getTime() + (nHour * 24), value: 0 }
        ];
    },

    _readCollections: function()
    {
        // 1. cleanup
        console.clear();
        console.log(this._sIntro);

        // 2. setup
        this._setupOutput();


        // --- pairs (all) ---


        // 2. analyse
        for (let nIndex = 0; nIndex < this._aDailyTimeSlots.length; nIndex++)
        {
            let timeSlot = this._aDailyTimeSlots[nIndex];

            this._dbCollection_pairs.find({ created : { $gte :  timeSlot.nStart, $lt : timeSlot.nEnd }}).toArray(function(nIndex, err, aDocs) {

                CoreModule_Assert.equal(err, null);

                this._aDailyValuesPairs[nIndex] = aDocs.length;

            }.bind(this, nIndex));
        }

        // 2. analyse
        for (let nIndex = 0; nIndex < this._aHourTimeSlots.length; nIndex++)
        {
            let timeSlot = this._aHourTimeSlots[nIndex];

            this._dbCollection_pairs.find({ created : { $gte :  timeSlot.nStart, $lt : timeSlot.nEnd }}).toArray(function(nIndex, err, aDocs) {

                CoreModule_Assert.equal(err, null);

                this._aHourlyValuesPairs[nIndex] = aDocs.length;

            }.bind(this, nIndex));
        }



        // --- pairs (connected) ---


        // 2. analyse
        for (let nIndex = 0; nIndex < this._aDailyTimeSlots.length; nIndex++)
        {
            let timeSlot = this._aDailyTimeSlots[nIndex];

            this._dbCollection_pairs.find({ created : { $gte :  timeSlot.nStart, $lt : timeSlot.nEnd }, "states.connectionEstablished": true}).toArray(function(nIndex, err, aDocs) {

                CoreModule_Assert.equal(err, null);

                this._aDailyValuesPairsConnected[nIndex] = aDocs.length;

            }.bind(this, nIndex));
        }

        // 2. analyse
        for (let nIndex = 0; nIndex < this._aHourTimeSlots.length; nIndex++)
        {
            let timeSlot = this._aHourTimeSlots[nIndex];

            this._dbCollection_pairs.find({ created : { $gte :  timeSlot.nStart, $lt : timeSlot.nEnd }, "states.connectionEstablished": true}).toArray(function(nIndex, err, aDocs) {

                CoreModule_Assert.equal(err, null);

                this._aHourlyValuesPairsConnected[nIndex] = aDocs.length;

            }.bind(this, nIndex));
        }



        // --- pairs (used) ---


        // 2. analyse
        for (let nIndex = 0; nIndex < this._aDailyTimeSlots.length; nIndex++)
        {
            let timeSlot = this._aDailyTimeSlots[nIndex];

            this._dbCollection_pairs.find({ created : { $gte :  timeSlot.nStart, $lt : timeSlot.nEnd }, "states.dataSent": true }).toArray(function(nIndex, err, aDocs) {

                CoreModule_Assert.equal(err, null);

                this._aDailyValuesPairsUsed[nIndex] = aDocs.length;

            }.bind(this, nIndex));
        }

        // 2. analyse
        for (let nIndex = 0; nIndex < this._aHourTimeSlots.length; nIndex++)
        {
            let timeSlot = this._aHourTimeSlots[nIndex];

            this._dbCollection_pairs.find(
                {
                    created : { $gte :  timeSlot.nStart, $lt : timeSlot.nEnd },
                    "states.dataSent": true
                }).toArray(function(nIndex, err, aDocs) {

                CoreModule_Assert.equal(err, null);

                this._aHourlyValuesPairsUsed[nIndex] = aDocs.length;

            }.bind(this, nIndex));
        }




        // --- hourly ---


        const SLOT_WIDTH_HOURLY = 5;

        let sOutput = '';
        let sOutputPairsAll = 'All       | ';
        let sOutputPairsConnected = 'Connected | ';
        let sOutputPairsUsed = 'Used      | ';
        for (let nIndex = 0; nIndex < this._aHourlyValuesPairs.length; nIndex++)
        {
            // register
            let sSlotAll = '' + this._aHourlyValuesPairs[nIndex];
            let sSlotConnected = '' + this._aHourlyValuesPairsConnected[nIndex];
            let sSlotUsed = '' + this._aHourlyValuesPairsUsed[nIndex];

            // grow
            while (sSlotAll.length < SLOT_WIDTH_HOURLY) sSlotAll = ' ' + sSlotAll;
            while (sSlotConnected.length < SLOT_WIDTH_HOURLY) sSlotConnected = ' ' + sSlotConnected;
            while (sSlotUsed.length < SLOT_WIDTH_HOURLY) sSlotUsed = ' ' + sSlotUsed;

            // compose
            sOutputPairsAll += sSlotAll;
            sOutputPairsConnected += sSlotConnected;
            sOutputPairsUsed += sSlotUsed;

            // compose
            if (nIndex < this._aHourTimeSlots.length - 1)
            {
                sOutputPairsAll += ' |';
                sOutputPairsConnected += ' |';
                sOutputPairsUsed += ' |';
            }
        }

        // grow
        let sDivider = '';
        while (sDivider.length < sOutputPairsAll.length) sDivider += '-';

        // compose
        sOutput += sOutputPairsAll +'\n' + sOutputPairsConnected +'\n' + sOutputPairsUsed + '\n' + sDivider + '\n';

        // prepare new line
        sOutput += 'Total     | ';

        for (let nIndex = 0; nIndex < this._aHourTimeSlots.length; nIndex++)
        {
            // register
            let sSlot = '' + this._aHourTimeSlots[nIndex].sLabel;

            // grow
            while (sSlot.length < SLOT_WIDTH_HOURLY) sSlot = ' ' + sSlot;

            // compose
            sOutput += sSlot;

            // compose
            if (nIndex < this._aHourTimeSlots.length - 1) sOutput += ' |';
        }

        console.log('Pairs per hour');
        console.log(sDivider);
        console.log(sOutput);
        console.log(sDivider);
        console.log('');


        // --- daily ---


        const SLOT_WIDTH_DAILY = 12;

        sOutput = '';
        sOutputPairsAll = 'All       | ';
        sOutputPairsConnected = 'Connected | ';
        sOutputPairsUsed = 'Used      | ';
        for (let nIndex = 0; nIndex < this._aDailyValuesPairs.length; nIndex++)
        {
            // register
            let sSlotAll = '' + this._aDailyValuesPairs[nIndex];
            let sSlotConnected = '' + this._aDailyValuesPairsConnected[nIndex];
            let sSlotUsed = '' + this._aDailyValuesPairsUsed[nIndex];

            // grow
            while (sSlotAll.length < SLOT_WIDTH_DAILY) sSlotAll = ' ' + sSlotAll;
            while (sSlotConnected.length < SLOT_WIDTH_DAILY) sSlotConnected = ' ' + sSlotConnected;
            while (sSlotUsed.length < SLOT_WIDTH_DAILY) sSlotUsed = ' ' + sSlotUsed;

            // compose
            sOutputPairsAll += sSlotAll;
            sOutputPairsConnected += sSlotConnected;
            sOutputPairsUsed += sSlotUsed;

            // compose
            if (nIndex < this._aDailyTimeSlots.length - 1)
            {
                sOutputPairsAll += ' |';
                sOutputPairsConnected += ' |';
                sOutputPairsUsed += ' |';
            }
        }

        // grow
        sDivider = '';
        while (sDivider.length < sOutputPairsAll.length) sDivider += '-';

        // compose
        sOutput += sOutputPairsAll +'\n' + sOutputPairsConnected +'\n' + sOutputPairsUsed + '\n' + sDivider + '\n';

        // prepare new line
        sOutput += 'Total     | ';

        for (let nIndex = 0; nIndex < this._aDailyTimeSlots.length; nIndex++)
        {
            // register
            let sSlot = '' + this._aDailyTimeSlots[nIndex].sLabel;

            // grow
            while (sSlot.length < SLOT_WIDTH_DAILY) sSlot = ' ' + sSlot;

            // compose
            sOutput += sSlot;

            // compose
            if (nIndex < this._aDailyTimeSlots.length - 1) sOutput += ' |';
        }

        console.log('Pairs per day');
        console.log(sDivider);
        console.log(sOutput);
        console.log(sDivider);
        console.log('');
    }

};

// auto-start
module.exports.__construct();
