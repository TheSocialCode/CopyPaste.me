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

    // init
    _app: null,
    _http: null,
    _io: null,

    // init
    _aTokens: [],
    _aSockets: [],


    // ----------------------------------------------------------------------------
    // --- Constructor ------------------------------------------------------------
    // ----------------------------------------------------------------------------


    /**
     * Constructor
     */
    __construct: function (sGateway)
    {
        // init
        this._app = Module_Express();
        this._http = Module_HTTP.createServer(this.app);
        this._io = Module_SocketIO(this._http);


        this._app.get('/', function(req, res){
            //res.sendFile(__dirname + '/index.html');
            res.send('<h1>Hello world 1</h1>');
        });


        var classRoot = this;


        this._io.on('connection', function(socket)
        {

            console.log('a user connected', socket.id);


            if (!classRoot._aSockets[''+socket.id])
            {
                console.log('New user connected');
            }
            else
            {
                console.log('Existing user reconnected');
            }

            // this._aSockets[socket.id] = {
            //     socket,
            //     aTokens: []
            // }




            socket.on('disconnect', function(){
                console.log('user disconnected');
            });


            socket.on('chat message', function(msg){
                console.log('message: ' + msg);
            });

            socket.on('request_token', function() {

                let sToken = Module_GenerateUniqueID({ length: 32 });


                classRoot._aTokens['' + sToken] = {
                    receiver: socket,
                };


                socket.emit('token', sToken);


                console.log('aTokens' + classRoot._aTokens);
            });


            socket.on('connect_token', function(sToken) {

                if (classRoot._aTokens['' + sToken])
                {
                    classRoot._aTokens['' + sToken].sender = socket;


                    // store list of connections per client (sender or receiver)

                    socket.emit('token_connected');

                    classRoot._aTokens['' + sToken].receiver.emit('sender_connected')
                }
                else
                {
                    socket.emit('token_not_found');
                }

                console.log('Connecting to token', sToken);
            });


            socket.on('data-password', function(data){

                classRoot._aTokens['' + data.sToken].receiver.emit('data-password', data.sPassword)

            });


        });

        this._http.listen(3000, function(){
            console.log('listening on *:3000');
        });
    }

};

// auto-start
module.exports.__construct();
