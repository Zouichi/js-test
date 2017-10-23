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


var particle = new Particle();
var token;

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
            console.log('Example app listening on port 3000!')
    		io.sockets.on('connection', function (socket) {
	    	console.log("un client est connecté");
	    	socket.emit('monsocket2', { hello: "world" });
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
});app.get('/users.html', function(req, res) {
    res.sendFile(__dirname + '/client/users.html')
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
                console.log('Devices: ', devices);
                // devices = JSON.parse(devices);
                console.log(devices.body);
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


        // Lecture de la photorésistance
        // particle.getEventStream({
        //     deviceId: '4e002d000751353530373132',
        //     auth: token

        // }).then(function(stream2) {
        //     stream.on('event2', function(data) {
        //         console.log("Event 2: " + JSON.strigify(data));
        //         io.sockets.emit('monsocket3', JSON.strigify(data));
        //     })
        // });
    },
    function(err) {
        console.log('Could not log in.', err);
    }
);