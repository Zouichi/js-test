// Repo : https://github.com/Zouichi/js-test

var Particle = require('particle-api-js');
const express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Devices = require('./models/devices.js');
var EventObj = require('./models/eventsObj.js');
var resistorRead = require('./models/resistorRead.js');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var Twitter = require('twitter');


var particle = new Particle();
var token;

var client = new Twitter({
  consumer_key: 'BnCnYT8WwUzbJBVFIOEuw96Wa',
  consumer_secret: 'MohDuyxuqKy0URCHfZIyuyHJgna1n19XlT1jpRsuCwcFKEXOjQ',
  access_token_key: '905686238056906752-eMMp715HVOOS4j2LbDmrwOrNoEoWfrE',
  access_token_secret: 'rJpDcvgVFcGliMllRa2iMQ4zoMbDRAnHVmysPr4GpKL0i'
});

// j'instancie la connexion mongo 
var promise = mongoose.connect('mongodb://localhost:27017/ifaObj', {
    useMongoClient: true,
});
// quand la connexion est réussie
promise.then(
    () => {
        console.log('db.connected');
        // je démarre mon serveur node sur le port 3000
        server.listen(3000, function() {
            console.log('App listening on port 3000!')
    		io.sockets.on('connection', function (socket) {
	    	console.log("un client est connecté");
			});
        });
    },
    err => {
        console.log('MONGO ERROR');
        console.log(err);
    }

);


// prends en charge les requetes du type ("Content-type", "application/x-www-form-urlencoded")
app.use(bodyParser.urlencoded({
    extended: true
}));
// prends en charge les requetes du type ("Content-type", "application/json")
app.use(bodyParser.json());

// serveur web
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/client/index.html')
});
app.get('/events-stream.html', function(req, res) {
    res.sendFile(__dirname + '/client/events-stream.html')
});
app.get('/users.html', function(req, res) {
    res.sendFile(__dirname + '/client/users.html')
});
app.get('/devices.html', function(req, res) {
    res.sendFile(__dirname + '/client/devices.html')
});
app.get('/tweet-stream.html', function(req, res) {
    res.sendFile(__dirname + '/client/tweet-stream.html')
});
app.get('/tweet-light.html', function(req, res) {
    res.sendFile(__dirname + '/client/tweet-light.html')
});
app.post('/particle', function(req, res) {
    console.log("une requete est arrivée");
    console.log(req);
});


particle.login({
    username: 'boiteux.remi@gmail.com',
    password: 'VALENTINIK'
}).then(
    function(data) {
        token = data.body.access_token;
        console.log(token);
        console.log('Hell yeah !');
        var devicesPr = particle.listDevices({
            auth: token
        });
        devicesPr.then(
            function(devices) {
                console.log('Devices: ', devices.body);
                io.sockets.emit('monsocket2', JSON.stringify(devices));
                // console.log(monsocket2);
                devices.body.forEach(function(device){
                    var toSave = new Devices(device);

                    toSave.save(function(err, success){
                        if(err){
                            console.log(err);
                        }
                        else{
                            console.log('device saved');
                        }
                    })
                });
            },
            function(err) {
                console.log('List devices call failed: ', err);
            }
        );
        //Get your devices events
        particle.getEventStream({
            deviceId: '4e002d000751353530373132',
            auth: token
        }).then(function(stream) {
            stream.on('event', function(data) {
                console.log("Event: " + JSON.stringify(data));
                io.sockets.emit('monsocket', JSON.stringify(data));
            });
        });

    },
    function(err) {
        console.log('Could not log in.', err);
    }
);

// Twitter stream
client.stream('statuses/filter', {track: 'javascript'}, function(stream) {
  stream.on('data', function(event) {
    // console.log(event && event.text);
    io.sockets.emit('newTwit', event);
  }); 
  stream.on('error', function(error) {
    throw error;
  });
});
