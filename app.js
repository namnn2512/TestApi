// app.js
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var express = require('express');
var app = express();
var http = require('http');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var bittrex = require('node.bittrex.api');
var autobahn = require('autobahn');
var wsuri = "wss://api.poloniex.com";

var connection = new autobahn.Connection({
    url: wsuri,
    realm: "realm1"
});

app.use(express.static(__dirname + '/bower_components'));
app.get('/', function (req, res, next) {
    // var url = "https://poloniex.com/public?"+"command=returnOrderBook"+"&currencyPair=BTC_NXT"+"&depth=10"

    // https.get(url, function(res){
    // var body = '';

    // res.on('data', function(chunk){
    //     body += chunk;
    // });

    // res.on('end', function(){
    //     console.log("Got a response: ", body);
    // });
    // }).on('error', function(e){
    //       console.log("Got an error: ", e);
    // });
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
    client.on('tradeCoin',function(data){
        io.emit('BTC_XMR',data);
    });
});


 connection.onopen = function (session) {
        console.log("Websocket connection open");
         function marketEvent(args, kwargs) {
             //client.emit('messages', args);
             io.emit('tradeCoin', args);
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

//bittrex
bittrex.websockets.listen( function( data ) {
  if (data.M === 'updateSummaryState') {
    data.A.forEach(function(data_for) {
      data_for.Deltas.forEach(function(marketsDelta) {
        io.emit('bittrexMessages', marketsDelta);
        console.log('Ticker Update for '+ marketsDelta.MarketName, marketsDelta);
      });
    });
  }
});

bittrex.websockets.subscribe(['BTC-ETH','BTC-SC','BTC-ZEN'], function(data) {
  if (data.M === 'updateExchangeState') {
    data.A.forEach(function(data_for) {
      console.log('Market Update for '+ data_for.MarketName, data_for);
    });
  }
});
