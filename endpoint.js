'use strict';

var inherits     = require('util').inherits,
	EventEmitter = require('events').EventEmitter;

function Endpoint() {
	if (!(this instanceof Endpoint)) {
		return new Endpoint();
	}

	EventEmitter.call(this);
	Endpoint.init.call(this);
}

inherits(Endpoint, EventEmitter);

Endpoint.init = function () {
	var self = this;

	process.on('message', function (m) {
		if (m.type === 'ready')
			self.emit('ready', m.data.options);
		else if (m.type === 'message')
			self.emit('message', m.data.message);
	});
};

Endpoint.prototype.sendListeningState = function() {
	process.send({
		type: 'listening'
	});
};

Endpoint.prototype.sendConnection = function(clientAddress) {
	process.send({
		type: 'connection',
		data: clientAddress
	});
};

Endpoint.prototype.sendDisconnect = function(clientAddress) {
	process.send({
		type: 'disconnect',
		data: clientAddress
	});
};

Endpoint.prototype.sendData = function(serverAddress, client, data) {
	process.send({
		type: 'data',
		data: {
			server: serverAddress,
			client: client,
			data: data
		}
	});
};

Endpoint.prototype.sendLog = function(title, description) {
	process.send({
		type: 'log',
		data: {
			title: title,
			description: description
		}
	});
};

Endpoint.prototype.sendError = function(error) {
	process.send({
		type: 'error',
		data: {
			name: error.name,
			message: error.message,
			stack: error.stack
		}
	});
};

Endpoint.prototype.sendClose = function() {
	process.send({
		type: 'close'
	});
};

process.on('uncaughtException', function (error) {
	console.error('Uncaught Exception', error);
	process.send({
		type: 'error',
		data: {
			name: error.name,
			message: error.message,
			stack: error.stack
		}
	});
});

process.on('exit', function () {
	process.send({
		type: 'exit'
	});
});

process.on('SIGTERM', function () {
	process.send({
		type: 'terminate'
	});
});

module.exports = Endpoint;