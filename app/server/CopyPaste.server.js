/**
 * CopyPaste.me
 *
 * @author Sebastian Kersten (@supertaboo)
 */

'use strict';


// import
const Module_HTTP = require('http');
const Module_SocketIO = require('socket.io');
const Module_Express = require('express');
const Module_GenerateUniqueID = require('generate-unique-id');



module.exports = {

    // services
    _app: null,
    _http: null,
    _io: null,

    // data
    _aPairs: [],
    _aSockets: [],

    // utils
    _timerGarbageCollection: null,
    _aPairsMarkedForRemoval: [],
    _nGarbageMaxAge: 1 * 60 * 1000,


    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function (sGateway)
    {
        // 1. init
        this._app = Module_Express();
        this._http = Module_HTTP.createServer(this.app);
        this._io = Module_SocketIO(this._http);

        // 2. configure
        this._io.on('connection', this._onUserConnect.bind(this));

        // 3. listen
        this._http.listen(3000, function(){
            console.log('listening on *:3000');
        });

        // 4. setup
        this._timerGarbageCollection = setInterval(this._collectGarbage.bind(this), 2000);

    },

    _onUserConnect: function(socket)
    {
        // 1. verify
        if (this._aSockets['' + socket.id]) { console.log('Existing user reconnected (p.s. This should not be happening!)'); return; }

        console.log('New user connected', socket.id);

        // 2. build
        let socketData = {
            socket: socket,
            sToken: ''
        };

        // 3. store
        this._aSockets['' + socket.id] = socketData;

        // 4. configure
        socket.on('disconnect', this._onUserDisconnect.bind(this, socket));
        socket.on('receiver_request_token', this._onReceiverRequestToken.bind(this, socket));
        socket.on('receiver_reconnect_to_token', this._onReceiverReconnectToToken.bind(this, socket));
        socket.on('sender_connect_to_token', this._onSenderConnectToToken.bind(this, socket, false));
        socket.on('sender_reconnect_to_token', this._onSenderConnectToToken.bind(this, socket, true));
        socket.on('data', this._onData.bind(this));
    },

    _onReceiverRequestToken: function(receiverSocket)
    {
        // 1. create
        let sToken = Module_GenerateUniqueID({ length: 32 });

        // 2. verify
        if (this._aPairs['' + sToken] || !this._aSockets['' + receiverSocket.id]) return;

        // 3. build
        let pair = {
            receiver: receiverSocket,
            sender: null
        };

        // 4. store
        this._aPairs['' + sToken] = pair;

        // 5. update
        this._aSockets['' + receiverSocket.id].sToken = sToken;

        console.log('');
        console.log('Sockets');
        console.log('=====================================================');
        console.log(this._aSockets);
        console.log('');
        console.log('Pairs');
        console.log('-----------------------------------------------------');
        console.log(this._aPairs);
        console.log('');
        console.log('');

        // 6. broadcast
        receiverSocket.emit('token', sToken);
    },

    _onReceiverReconnectToToken: function(receiverSocket, sToken)
    {
        console.log('Receiver reconnect to ', sToken);

        // 1. validate
        if (!this._aPairs['' + sToken])
        {
            // a. broadcast
            receiverSocket.emit('token_not_found');

            // b. exit
            return;
        }


        // ---


        // 2. load
        let pair = this._aPairs['' + sToken];

        // 3. validate
        if (pair.receiver)
        {
            this._broadcastSecurityWarning(receiverSocket, pair, sToken);
            return;
        }


        // ---


        // 4. store
        this._aPairs['' + sToken].receiver = receiverSocket;

        // 6. broadcast
        receiverSocket.emit('token_reconnected');

        // 7. save from garbage collection
        if (this._aPairsMarkedForRemoval['' + sToken]) delete this._aPairsMarkedForRemoval['' + sToken];

        // 8. broadcast
        if (pair.sender) pair.sender.emit('receiver_reconnected')
    },

    _onSenderConnectToToken: function(senderSocket, bReconnect, sToken)
    {
        // 1. validate
        if (!this._aPairs['' + sToken])
        {
            // a. broadcast
            senderSocket.emit('token_not_found');

            // b. exit
            return;
        }


        // ---


        // 2. load
        let pair = this._aPairs['' + sToken];

        // 3. validate
        if (pair.sender)
        {
            this._broadcastSecurityWarning(senderSocket, pair, sToken);
            return;
        }


        // ---


        // 4. store
        this._aPairs['' + sToken].sender = senderSocket;

        // 5. update
        this._aSockets['' + senderSocket.id].sToken = sToken;

        // 6. broadcast
        senderSocket.emit((bReconnect) ? 'token_reconnected' : 'token_connected');

        // 7. save from garbage collection
        if (this._aPairsMarkedForRemoval['' + sToken]) delete this._aPairsMarkedForRemoval['' + sToken];

        // 8. broadcast
        if (pair.receiver) pair.receiver.emit((bReconnect) ? 'sender_reconnected' : 'sender_connected');
    },

    _onUserDisconnect: function(socket)
    {
        console.log('User disconnected ...', socket.id);


        // 1. validate
        if (!this._aSockets['' + socket.id]) return;

        // 2. load
        let registeredSocket = this._aSockets['' + socket.id];

        // 3. register
        let sToken = registeredSocket.sToken;

        // 4. validate
        if (!sToken) return;




        // cleanup connected pair

        // cleanup
        delete this._aSockets['' + socket.id];


        console.log('this._aSockets.length = ' + this._aSockets.length);



        // 4. load
        let pair = this._aPairs['' + sToken];


        if (pair.receiver && pair.receiver.id === socket.id)
        {
            console.log('Receiver of pair has been disconnected');

            // cleanup
            pair.receiver = null;

            // mark
            this._markForRemoval(sToken);

            if (pair.sender) pair.sender.emit('receiver_disconnected');
        }

        if (pair.sender && pair.sender.id === socket.id)
        {
            console.log('Sender of pair has been diconnected');

            // cleanup
            pair.sender = null;

            // mark
            this._markForRemoval(sToken);

            if (pair.receiver) pair.receiver.emit('sender_disconnected');
        }


        // cleanup if both removed
        // array: aUnusedTokens -> timestamp

    },



    _onData: function(data)
    {
        // 1. validate
        if (!this._aPairs['' + data.sToken]) return;

        // 2. broadcast
        this._aPairs['' + data.sToken].receiver.emit('data', { sType:data.sType, value:data.value });
    },

    _broadcastSecurityWarning: function(requestingSocket, pair, sToken)
    {
        // a. broadcast breach to current user
        requestingSocket.emit('security_compromised');

        // b. cleanup
        delete this._aSockets['' + requestingSocket.id];

        // c. verify
        if (pair.receiver)
        {
            // I. broadcast
            pair.receiver.emit('security_compromised');

            // II. cleanup
            delete this._aSockets['' + pair.receiver.id];
        }

        // d. verify
        if (pair.sender)
        {
            // I. broadcast
            pair.sender.emit('security_compromised');

            // II. cleanup
            delete this._aSockets['' + pair.sender.id];
        }

        // e. clear
        delete this._aPairs['' + sToken];
    },


    _markForRemoval: function(sToken)
    {
        // 1. skip if already marked
        if (this._aPairsMarkedForRemoval['' + sToken]) return;

        // 2. store
        this._aPairsMarkedForRemoval.push({
            sToken: sToken,
            nMomentItGotMarked: new Date().getTime()
        });
    },

    _collectGarbage: function()
    {

        // send remaining connection message about end of session
        // senderTimeout
        // receiverTimeout
        // if both connected or reconnected -> end of markedAsGarbage





        // read
        let nItemCount = this._aPairsMarkedForRemoval.length;



        console.log('Garbage', nItemCount, this._aPairsMarkedForRemoval);

        // verify
        if (nItemCount > 0)
        {
            // verify all garbage items
            for (let nItemIndex = 0; nItemIndex < nItemCount; nItemIndex++)
            {
                // register
                let itemInGarbage = this._aPairsMarkedForRemoval[nItemIndex];

                if (new Date().getTime() - itemInGarbage.nMomentItGotMarked > this._nGarbageMaxAge)
                {
                    console.log('Remove from garbage maybe?');

                    // 1. validate [ possibly not necessary ] todo
                    if (!this._aPairs['' + itemInGarbage.sToken]) continue;

                    let pair = this._aPairs['' + itemInGarbage.sToken];

                    // pair is obsolete
                    if (!pair.sender && !pair.receiver)
                    {
                        console.log('Yeah, do it!');

                        delete this._aPairs['' + itemInGarbage.sToken];

                        // remove
                        this._aPairsMarkedForRemoval.splice(nItemIndex, 1);

                        // update
                        nItemIndex--;
                        nItemCount--;
                    }

                    // pair is perfectly fine
                    if (pair.sender && pair.receiver)
                    {
                        // remove
                        this._aPairsMarkedForRemoval.splice(nItemIndex, 1);

                        // update
                        nItemIndex--;
                        nItemCount--;
                    }
                }
            }
        }
    }

};

// auto-start
module.exports.__construct();
