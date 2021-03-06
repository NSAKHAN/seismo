var util = require('util');
var moment = require('moment');
var stub = require('./stub');

var logger = {
	success: function (message) {
		this.log('success', message);
	},

	warning: function (message) {
		this.log('warning', message);
	},

	error: function (message) {
		this.log('err', message);
	},

	info: function (message) {
		this.log('info', message);
	},

	log: function (type, message) {
		var record = this.timestamptMessage(util.format('%s: %s', type.toUpperCase(), this.formatMessage(message)));
		console.log(record);
	},

	formatMessage: function (message) {
		return typeof message === 'string' ? message : JSON.stringify(message);
	},

	timestamptMessage: function (message) {
		return util.format('[%s] %s', moment(), message);
	}

};

module.exports = (function () {
	var env = process.env.NODE_ENV || 'development';
	if (env === 'test') {
		return stub(logger);
	}

	return logger;
})();