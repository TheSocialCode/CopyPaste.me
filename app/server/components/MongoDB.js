/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import
const Token = require('./Token');

// import extenders
const EventDispatcherExtender = require('./../../common/extenders/EventDispatcherExtender');

// import core classes
const CoreModule_Assert = require('assert');

// import external classes
const Module_MongoDB = require("mongodb");



module.exports = function(configFile, config)
{
    // start
    this.__construct(configFile, config);
};

module.exports.prototype = {

    // services
    _mongoClient: null,

    // settings
    _bIsRunning: false,

    // events
    MONGODB_READY: 'mongodb_ready',

    // database
    _db: null,
    _aCollections: {
        pairs: null,
        exceptions: null
    },



    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function (configFile, config)
    {
        // 1. extend
        new EventDispatcherExtender(this);


        // ---


        // 2. verify
        if (!config.mongo) return;

        // 3. init
        this._mongoClient = Module_MongoDB.MongoClient;

        // 4. init
        let sMongoURL = 'mongodb://';

        // 5. compose
        if (config.mongoauthenticate)
        {
            // a. convert and register
            let sUsername = encodeURIComponent(configFile.mongodb.username.toString());
            let sPassword = encodeURIComponent(configFile.mongodb.password.toString());

            // b. compose
            sMongoURL += sUsername + ':' + sPassword + '@';
        }

        // 6. compose
        sMongoURL += configFile.mongodb.host.toString() + ':' + configFile.mongodb.port.toString();
        if (config.mongoauthenticate) sMongoURL += '?authMechanism=SCRAM-SHA-1&authSource=' + configFile.mongodb.dbname;

        // 7. connect
        this._mongoClient.connect(sMongoURL, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        }, this._onMongoDBConnected.bind(this, configFile));


        // mongoose
        //     .connect(process.env.MONGO_URI, {
        //         useUnifiedTopology: true,
        //         useNewUrlParser: true,
        //     })
        //     .then(() => console.log('DB Connected!'))
        //     .catch(err => {
        //         console.log(DB Connection Error: ${err.message});
        //     });
    },


    // ----------------------------------------------------------------------------
    // --- Public methods ---------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Check if MongoDB is running
     * @returns boolean
     */
    isRunning: function()
    {
        // 1. respond
        return this._bIsRunning;
    },

    /**
     * Get MongoDB collection reference
     * @param sName
     */
    getCollection: function(sName)
    {
        // 1. load and respond
        return this._aCollections[sName];
    },



    // ----------------------------------------------------------------------------
    // --- Private functions - Event handlers -------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Handle MongoDB connect
     * @param configFile
     * @param err
     * @param client
     * @private
     */
    _onMongoDBConnected: function(configFile, err, client)
    {
        // 1. validate
        CoreModule_Assert.equal(null, err);

        // 2. init
        const sMongoDBName = configFile.mongodb.dbname.toString();

        // 3. setup
        this._db = client.db(sMongoDBName);

        // 4. store
        this._aCollections['pairs'] = this._db.collection('pairs');
        this._aCollections['exceptions'] = this._db.collection('exceptions');

        // 5. toggle
        this._bIsRunning = true;

        // 6. broadcast
        this.dispatchEvent(this.MONGODB_READY);
    }

};
