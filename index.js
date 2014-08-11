// dependencies
var express = require("express");
var fs = require("fs");

// initialization
var app = express();
var contents = fs.readFileSync("./config/config.json");
var config = JSON.parse(contents);

// app variables
var c_name = config.cname;
var queue = config.queue;
var clients = [];

var announcements = '';

// setup jade templates
app.set('views', __dirname + '/tpl');
app.set('view engine', "jade");
app.engine('jade', require('jade').__express);

// route
app.get("/server", function(req, res) {
	res.render("server");
});
app.get("/", function(req, res) {
	res.render("client");
});

// set public directory
app.use(express.static(__dirname + '/public'));



//app.listen(port);
//var io = require('socket.io').listen(app.listen(config.port), {log:false});
var io = require('socket.io').listen(app.listen(config.port));

// socket.io events
io.sockets.on('connection', function(socket) {

	var client;

	fs.readFile('./public/announcements.json', 'utf-8', function(error, data) {
		io.sockets.emit('announce', data);
	});

	fs.watchFile('./public/announcements.json', function(curr, prev) {
		fs.readFile('./public/announcements.json', 'utf-8', function(error, data) {
			io.sockets.emit('announce', data);
		});
	});

	// when client clicks the connect
	socket.on('login', function(num) {
		console.log(num);
		client = addClient(num);
		if (client) {
			console.log(client);
			socket.emit('ready', client);
			socket.broadcast.emit('clientupdate', clients);
		} else {
			console.log('error');
			socket.emit('error', 'Number already exists. Please pick another number.');
		}
	});

	// when client disconnects
	socket.on('disconnect', function() {
		if(removeClient(client)) {
			socket.broadcast.emit('clientupdate', clients);
		}
	})

	// when client clicks next
	socket.on('next', function() {
		client.queue = queue;
		client.active = 'active';
		socket.broadcast.emit('clientupdate', clients);
		socket.broadcast.emit('call', client);
		socket.emit('nextcb', queue);
		queue++;
	});

	// when client clicks the call again
	socket.on('again', function() {
		if (client.queue != '-') {
			socket.broadcast.emit('againcb', client);
		};
	});

	// when client chooses to override the number priority
	socket.on('administer', function(data) {
		if(data.password == config.password) {
			queue = data.queue;
			socket.emit('administered');
		} else {
			socket.emit('error', 'Wrong password!');
		}
	});
});



var addClient = function(num) {
	if (!array_exists(num)) {
		var client = {
			name : config.cname + num,
			id : num,
			active: '',
			queue : '-'
		};
		clients.push(client);
		updateClients();
		return client;
	} else { return false;}
};

var array_exists = function(id) {
	for (var i = 0; i < clients.length; i++) {
		if (clients[i].id == id) {
			return true;
		};
	};
	return false;
};

var removeClient = function(client) {
	if(typeof(client) == 'undefined') {
		console.log('server');
		return false;
	}
	for (var i = 0; i < clients.length; i++) {
		if (typeof(client) != "undefined" && client.id == clients[i].id) {
			clients.splice(i, 1);
			break;
		};
	};
	console.log('for update');
	updateClients();
	return true;
};

var updateClients = function() { // sort clients
	clients = sortByKey(clients, 'id');
}

var sortByKey = function(array, key) {
	return array.sort(function(a, b) {
		var x = Number (a[key]);
		var y = Number (b[key]);
		return ((x < y) ? -1 : ((x > y) ? 1 : 0));
	});
}