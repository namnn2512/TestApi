// app.js
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var autobahn = require('autobahn');
var wsuri = "wss://api.poloniex.com";

var connection = new autobahn.Connection({
    url: wsuri,
    realm: "realm1"
});

app.use(express.static(__dirname + '/bower_components'));
app.get('/', function (req, res, next) {
    res.sendFile(__dirname + '/index.html');
});

server.listen(process.env.PORT);


io.on('connection', function (client) {
    console.log('Client connected...');

    client.on('join', function (data) {
        console.log(data);

    });
    
    client.on('sendMessages', function (data) {
        io.emit('broadcastMessages', data);
    });
    client.on('BTC_XMR', function (data) {
        io.emit('BTC_XMR', data);
    });
});


 connection.onopen = function (session) {
        console.log("Websocket connection open");
         function marketEvent(args, kwargs) {
             client.emit('messages', args);
             io.emit('messages', args);
             console.log(args);
        }
        function tickerEvent(args, kwargs) {
            // client.emit('messages', args);
            io.emit('messages', args);
         }
//         function trollboxEvent(args, kwargs) {
//             // client.emit('messages', args);
//             io.emit('messages', args);
//         }
        session.subscribe('BTC_XMR', marketEvent);
        session.subscribe('ticker', tickerEvent);
        //session.subscribe('trollbox', trollboxEvent);
    }

    connection.onclose = function (a,b) {
        console.log(b);
        console.log("Websocket connection closed");
    }


    connection.open();
// // Import the module
// var polo = require("poloniex-unofficial");

// // Get access to the push API
// var poloPush = new polo.PushWrapper();

// // Some currency pairs to watch
// var watchList = ["BTC_ETH", "BTC_XMR"];

// // Get price ticker updates
// poloPush.ticker((err, response) => {
//     if (err) {
//         // Log error message
//         console.log("An error occurred: " + err.msg);

//         // Disconnect
//         return true;
//     }

//     // Check if this currency is in the watch list
//     if (watchList.indexOf(response.currencyPair) > -1) {
//         // Log the currency pair and its last price
//         console.log(response.currencyPair + ": " + response.last);
//     }
// });
