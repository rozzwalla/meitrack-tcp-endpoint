'use strict';

var net          = require('net'),
	_            = require('lodash'),
	inherits     = require('util').inherits,
	EventEmitter = require('events').EventEmitter;

function Server(port, host, options) {
	if (!(this instanceof Server)) {
		return new Server(port, host, options);
	}

	EventEmitter.call(this);
	Server.init.call(this, port, host, options);
}

inherits(Server, EventEmitter);

Server.init = function (port, host, options) {
	var self = this;

	if (!parseInt(port)) {
		throw new Error('Port is mandatory!');
	}

	if (_.isObject(host)) {
		options = host;
		host = 'localhost';
	}

	this._clients = {};
	this._port = port;
	this._host = host || 'localhost';
	this._timeout = (options && options.timeout) || 3600000;
	this._keepalive = (options && options.keepalive) || true;
	this._keepaliveTimeout = (options && options.keepaliveTimeout) || 60000;

	function handler(socket) {
		var client = socket.remoteAddress + ':' + socket.remotePort;

		socket.setKeepAlive(self._keepalive, self._keepaliveTimeout);
		socket.setTimeout(self._timeout);

		if (options && options.readEncoding) {
			socket.setEncoding(options.readEncoding);
		}

		function data(_data) {
			self.emit('data', client, _data);
		}

		function timeout() {
			socket.destroy();
		}

		function error(err, client, _data) {
			self.emit('client_error', err, client, _data);
		}

		function close() {
			delete self._clients[client];
			self.emit('client_off', client);
		}

		process.nextTick(function register() {
			socket.on('data', data);
			socket.on('timeout', timeout);
			socket.on('error', error);
			socket.on('close', close);
		});
	}

	self._server = net.createServer(handler);

	function listening() {
		self.emit('ready');
	}

	function error(err) {
		self.emit('error', err);
	}

	function close() {
		self.emit('close');
	}

	function connection(socket) {
		self._clients[socket.remoteAddress + ':' + socket.remotePort] = socket;
		self.emit('client_on', socket.remoteAddress + ':' + socket.remotePort);
	}

	process.nextTick(function register() {
		self._server.on('listening', listening);
		self._server.on('connection', connection);
		self._server.on('close', close);
		self._server.on('error', error);
	}, this);
};

Server.prototype.listen = function () {
	this._server.listen(this._port, this._host);
};

Server.prototype.close = function (callback) {
	callback = callback || function () {
		};
	this._server.close(callback);
};

Server.prototype.send = function (client, message, end, callback) {
	if (typeof end === 'function') {
		callback = end;
		end = false;
	}

	callback = callback || function () {
		};
	message = message || new Buffer([0x00]);

	if (!Buffer.isBuffer(message)) {
		message = new Buffer(message.toString() + '\r\n');
	}

	if (_.contains(_.keys(this._clients), client)) {
		if (end) {
			this._clients[client].end(message);
			callback();
		} else {
			this._clients[client].write(message, callback);
		}
	} else {
		this._clients[client].emit('error',
			new Error(),
			client,
			message);
		callback();
	}
};

Server.prototype.getClients = function () {
	return _.keys(this._clients);
};

module.exports = Server;