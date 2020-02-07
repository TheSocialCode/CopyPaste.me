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


        // --- Mongo DB

        // 4. init
        this._mongo = Module_MongoDB.MongoClient;

        // 5. configure
        const sMongoURL = 'mongodb://' + this._configFile.mongodb.host.toString() + ':' + this._configFile.mongodb.port.toString();

        // 6. connect
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
        this._timerMonitor = setInterval(this._readCollections.bind(this), 1000);
    },

    _readCollections: function()
    {

        // 1. cleanup
        console.clear();

        // 2. prepare
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

        // 3. find max length
        let nMaxLength = 0;
        for (let nLineIndex = 0; nLineIndex < aLines.length; nLineIndex++)
        {
            // a. calculate
            if (aLines[nLineIndex].length > nMaxLength) nMaxLength = aLines[nLineIndex].length;
        }

        // 4. build and output lines
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
            console.log(aLines[nLineIndex]);
        }

        // 5. output extra line
        console.log();




        const today = new Date();
        let startOfTheDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());

        //console.log('Start of the day: ', startOfTheDay.getTime(), 'End of the day: ', startOfTheDay.getTime() + 1000 * 60 * 60 * 24 );

        //console.log('Aantal: ', this._dbCollection_sockets.find({ created : { $gte :  startOfTheDay.getTime(), $lt : startOfTheDay.getTime() + 1000 * 60 * 60  }}).count());


        //new Date(today.getFullYear(), today.getMonth(), today.getDate());

        // 1580598000000
        // 1580659676547
        // 1580684400000


        const nDay = 1000 * 60 * 60 * 24;

        let aDayTimeSlots = [
            { sLabel: 'today', nStart: startOfTheDay.getTime() - (nDay * 0), nEnd: startOfTheDay.getTime() + (nDay * 1) },
            { sLabel: 'yesterday', nStart: startOfTheDay.getTime() - (nDay * 1), nEnd: startOfTheDay.getTime() + (nDay * 0) },
            { sLabel: '2 days ago', nStart: startOfTheDay.getTime() - (nDay * 2), nEnd: startOfTheDay.getTime() + (nDay * -1) },
            { sLabel: '3 days ago', nStart: startOfTheDay.getTime() - (nDay * 3), nEnd: startOfTheDay.getTime() + (nDay * -2) },
            { sLabel: '4 days ago', nStart: startOfTheDay.getTime() - (nDay * 4), nEnd: startOfTheDay.getTime() + (nDay * -3) },
            { sLabel: '5 days ago', nStart: startOfTheDay.getTime() - (nDay * 5), nEnd: startOfTheDay.getTime() + (nDay * -4) },
            { sLabel: '6 days ago', nStart: startOfTheDay.getTime() - (nDay * 6), nEnd: startOfTheDay.getTime() + (nDay * -5) },
        ];


        for (let nIndex = 0; nIndex < aDayTimeSlots.length; nIndex++)
        {
            let timeSlot = aDayTimeSlots[nIndex];

            this._dbCollection_sockets.find({ created : { $gte :  timeSlot.nStart, $lt : timeSlot.nEnd }}).toArray(function(sLabel, nIndex, err, aDocs) {

                CoreModule_Assert.equal(err, null);

                this._buildOutput(nIndex, sLabel + ': ' + aDocs.length);

            }.bind(this, timeSlot.sLabel, nIndex + 2));
        }


        const nHour = 1000 * 60 * 60;

        let aHourTimeSlots = [
            { sLabel: '00:00 - 00:59', nStart: startOfTheDay.getTime() + (nHour * 0), nEnd: startOfTheDay.getTime() + (nHour * 1) },
            { sLabel: '01:00 - 01:59', nStart: startOfTheDay.getTime() + (nHour * 1), nEnd: startOfTheDay.getTime() + (nHour * 2) },
            { sLabel: '02:00 - 02:59', nStart: startOfTheDay.getTime() + (nHour * 2), nEnd: startOfTheDay.getTime() + (nHour * 3) },
            { sLabel: '03:00 - 03:59', nStart: startOfTheDay.getTime() + (nHour * 3), nEnd: startOfTheDay.getTime() + (nHour * 4) },
            { sLabel: '04:00 - 04:59', nStart: startOfTheDay.getTime() + (nHour * 4), nEnd: startOfTheDay.getTime() + (nHour * 5) },
            { sLabel: '05:00 - 05:59', nStart: startOfTheDay.getTime() + (nHour * 5), nEnd: startOfTheDay.getTime() + (nHour * 6) },
            { sLabel: '06:00 - 06:59', nStart: startOfTheDay.getTime() + (nHour * 6), nEnd: startOfTheDay.getTime() + (nHour * 7) },
            { sLabel: '07:00 - 07:59', nStart: startOfTheDay.getTime() + (nHour * 7), nEnd: startOfTheDay.getTime() + (nHour * 8) },
            { sLabel: '08:00 - 08:59', nStart: startOfTheDay.getTime() + (nHour * 8), nEnd: startOfTheDay.getTime() + (nHour * 9) },
            { sLabel: '09:00 - 09:59', nStart: startOfTheDay.getTime() + (nHour * 9), nEnd: startOfTheDay.getTime() + (nHour * 10) },
            { sLabel: '10:00 - 10:59', nStart: startOfTheDay.getTime() + (nHour * 10), nEnd: startOfTheDay.getTime() + (nHour * 11) },
            { sLabel: '11:00 - 11:59', nStart: startOfTheDay.getTime() + (nHour * 11), nEnd: startOfTheDay.getTime() + (nHour * 12) },
            { sLabel: '12:00 - 12:59', nStart: startOfTheDay.getTime() + (nHour * 12), nEnd: startOfTheDay.getTime() + (nHour * 13) },
            { sLabel: '13:00 - 13:59', nStart: startOfTheDay.getTime() + (nHour * 13), nEnd: startOfTheDay.getTime() + (nHour * 14) },
            { sLabel: '14:00 - 14:59', nStart: startOfTheDay.getTime() + (nHour * 14), nEnd: startOfTheDay.getTime() + (nHour * 15) },
            { sLabel: '15:00 - 15:59', nStart: startOfTheDay.getTime() + (nHour * 15), nEnd: startOfTheDay.getTime() + (nHour * 16) },
            { sLabel: '16:00 - 16:59', nStart: startOfTheDay.getTime() + (nHour * 16), nEnd: startOfTheDay.getTime() + (nHour * 17) },
            { sLabel: '17:00 - 17:59', nStart: startOfTheDay.getTime() + (nHour * 17), nEnd: startOfTheDay.getTime() + (nHour * 18) },
            { sLabel: '18:00 - 18:59', nStart: startOfTheDay.getTime() + (nHour * 18), nEnd: startOfTheDay.getTime() + (nHour * 19) },
            { sLabel: '19:00 - 19:59', nStart: startOfTheDay.getTime() + (nHour * 19), nEnd: startOfTheDay.getTime() + (nHour * 20) },
            { sLabel: '20:00 - 20:59', nStart: startOfTheDay.getTime() + (nHour * 20), nEnd: startOfTheDay.getTime() + (nHour * 21) },
            { sLabel: '21:00 - 21:59', nStart: startOfTheDay.getTime() + (nHour * 21), nEnd: startOfTheDay.getTime() + (nHour * 22) },
            { sLabel: '22:00 - 22:59', nStart: startOfTheDay.getTime() + (nHour * 22), nEnd: startOfTheDay.getTime() + (nHour * 23) },
            { sLabel: '23:00 - 23:59', nStart: startOfTheDay.getTime() + (nHour * 23), nEnd: startOfTheDay.getTime() + (nHour * 24) },

        ];


        for (let nIndex = 0; nIndex < aHourTimeSlots.length; nIndex++)
        {
            let timeSlot = aHourTimeSlots[nIndex];

            this._dbCollection_sockets.find({ created : { $gte :  timeSlot.nStart, $lt : timeSlot.nEnd }}).toArray(function(sLabel, nIndex, err, aDocs) {

                CoreModule_Assert.equal(err, null);

                this._buildOutput(nIndex, sLabel + ': ' + aDocs.length);

            }.bind(this, timeSlot.sLabel, nIndex + 11));
        }


        let sOutput = '';
        for (let nIndex = 0; nIndex < this._txtOutput.length; nIndex++)
        {
            sOutput += this._txtOutput[nIndex] + '\n';
        }
        console.log(sOutput);







        //
        // const collection = db.collection('pairs');
        // // Insert some documents
        // collection.insertMany([
        //     {a : 1}, {a : 2}, {a : 3}
        // ]);
        //
        // collection.find({'a': 3}).toArray(function(err, docs) {
        //     CoreModule_Assert.equal(err, null);
        //
        //     console.log('Result of find', docs);
        // });

    },

    _txtOutput: [
        'Sockets',
        '=====================================',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '-------------------------------------',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '=====================================',
        ''
    ],

    _buildOutput: function(nIndex, sLine)
    {
        this._txtOutput[nIndex] = sLine;
    }

};

// auto-start
module.exports.__construct();
