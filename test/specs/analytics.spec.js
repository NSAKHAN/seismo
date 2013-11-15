var moment = require('moment');
var client = require('../../source/client');
var testUtils = require('../utils');

describe('analytics.spec.js', function () {
	var app, events, error, response, options;

	before(function () {
		options = {
			credentials: {
				token: 'ebf6140a6314d7508a02300961636e9feffa73da'
			}
		};
	});

	describe('create client', function () {
		beforeEach(function () {
			events = client('simple-client-app', options);
		});

		it('should be initialized', function () {
			expect(events).to.be.ok;
		});
	});

	describe('posting events', function () {
		before(function () {
			app = 'test-posting-app-' + moment().valueOf();
		});

		before(function () {
			events = client(app, options);
		});

		describe('with only event name', function () {
			before(function (done) {
				events('my first event', function (err, resp) {
					error = err;
					response = resp;
					console.log(err);
					done(err);
				});
			});

			it('should be posted', function () {
				expect(error).to.not.be.ok;
			});

			it('should have id', function () {
				expect(response.id).to.equal('my-first-event');
			});

			it('should have event', function () {
				expect(response.event).to.equal('my first event');
			});

			it('should have timestampt', function () {
				expect(response.timestampt).to.be.ok;
			});

			describe('with data', function () {
				before(function (done) {
					events('my first event', {environment: process.env.NODE_ENV}, function (err, resp) {
						error = err;
						response = resp;
						done(err);
					});
				});

				it('should be posted', function () {
					expect(error).to.not.be.ok;
				});

				it('should have data', function () {
					expect(response.data.environment).to.equal(process.env.NODE_ENV);
				});
			});
		});

		describe('with id and event name', function () {
			before(function (done) {
				events({id: 'second-event', event: 'my second event'}, function (err, resp) {
					error = err;
					response = resp;
					done(err);
				});
			});

			it('should be posted', function () {
				expect(error).to.not.be.ok;
			});

			it('should have id', function () {
				expect(response.id).to.equal('second-event');
			});

			it('should have event', function () {
				expect(response.event).to.equal('my second event');
			});

			it('should have timestampt', function () {
				expect(response.timestampt).to.be.ok;
			});

			describe('with data', function () {
				before(function (done) {
					events({id: 'second-event', event: 'my second event'}, {environment: process.env.NODE_ENV}, function (err, resp) {
						error = err;
						response = resp;
						done(err);
					});
				});

				it('should be posted', function () {
					expect(error).to.not.be.ok;
				});

				it('should have data', function () {
					expect(response.data.environment).to.equal(process.env.NODE_ENV);
				});
			});

		});

		describe('when id is missing', function () {
			before(function (done) {
				events({event: 'my third event'}, function (err, resp) {
					error = err;
					response = resp;
					done(err);
				});
			});

			it('should be posted', function () {
				expect(error).to.not.be.ok;
			});

			it('should have generated id', function () {
				expect(response.id).to.equal('my-third-event');
			});

			it('should have event', function () {
				expect(response.event).to.equal('my third event');
			});

			it('should have timestampt', function () {
				expect(response.timestampt).to.be.ok;
			});
		});
	});

	describe('quering events', function () {
		var results;

		before(function () {
			app = 'test-quering-app-' + moment().valueOf();
		});

		before(function (done) {
			testUtils.createQueringData(app, done);
		});

		before(function () {
			events = client(app, options);
		});

		describe('all events', function () {
			before(function (done) {
				events.query(function (err, res) {
					error = err;
					results = res;
					done(err);
				});
			});

			it('should return all events for app', function () {
				expect(results.length).to.equal(13);
			});
		});

		describe('by event name', function () {
			before(function (done) {
				events.query('application started', function (err, res) {
					error = err;
					results = res;
					done(err);
				});
			});

			it('should return all events by given name', function () {
				expect(results.length).to.equal(5);
			});
		});

		describe('by event id', function () {
			before(function (done) {
				events.query({id: 'app-stopped'}, function (err, res) {
					error = err;
					results = res;
					done(err);
				});
			});

			it('should return all events by given id', function () {
				expect(results.length).to.equal(5);
			});
		});

		describe('by date', function () {
			before(function (done) {
				events.query({date: '2013-01-28'}, function (err, res) {
					error = err;
					results = res;
					done(err);
				});
			});

			it('should return all events by given date', function () {
				expect(results.length).to.equal(2);
			});
		});

		describe('by today', function () {
			before(function (done) {
				events.query({date: 'today'}, function (err, res) {
					error = err;
					results = res;
					done(err);
				});
			});

			it('should return all events by today', function () {
				expect(results.length).to.equal(3);
			});
		});

		describe('by name and date', function () {
			before(function (done) {
				events.query({event: 'application started', date: '2013-01-25'}, function (err, res) {
					error = err;
					results = res;
					done(err);
				});
			});

			it('should return all events by date and event name', function () {
				expect(results.length).to.equal(1);
			});
		});

		describe('by id and date', function () {
			before(function (done) {
				events.query({id: 'app-started', date: '2013-01-25'}, function (err, res) {
					error = err;
					results = res;
					done(err);
				});
			});

			it('should return all events by date and event name', function () {
				expect(results.length).to.equal(1);
			});
		});
	});

	describe('building reports', function () {
		var summary;

		before(function () {
			app = 'test-reporting-app-' + moment().valueOf();
		});

		before(function (done) {
			testUtils.createReportingData(app, done);
		});

		before(function () {
			events = client(app, options);
		});

		describe('report by hour', function () {
			before(function (done) {
				events.report({event: 'application started', report: 'hour', date: '2013-09-29', hour: 6}, function (err, sum) {
					error = err;
					summary = sum;
					done(err);
				});
			});

			it('should have event data', function () {
				expect(summary.id).to.equal('app-started');
				expect(summary.event).to.equal('application started');
			});

			it('should have total', function () {
				expect(summary.total).to.equal(3);
			});
		});

		describe('report by day', function () {
			before(function (done) {
				events.report({event: 'application started', report: 'day', date: '2013-09-29'}, function (err, sum) {
					error = err;
					summary = sum;
					done(err);
				});
			});

			it('should have event data', function () {
				expect(summary.id).to.equal('app-started');
				expect(summary.event).to.equal('application started');
			});

			it('should have total', function () {
				expect(summary.total).to.equal(6);
			});
		});

		describe('report by week', function () {
			before(function (done) {
				events.report({event: 'application started', report: 'week', date: '2013-09-29'}, function (err, sum) {
					error = err;
					summary = sum;
					done(err);
				});
			});

			it('should have event data', function () {
				expect(summary.id).to.equal('app-started');
				expect(summary.event).to.equal('application started');
			});

			it('should have total', function () {
				expect(summary.total).to.equal(18);
			});
		});

		describe('report by month', function () {
			before(function (done) {
				events.report({event: 'application started', report: 'month', date: '2013-09-29'}, function (err, sum) {
					error = err;
					summary = sum;
					done(err);
				});
			});

			it('should have event data', function () {
				expect(summary.id).to.equal('app-started');
				expect(summary.event).to.equal('application started');
			});

			it('should have total', function () {
				expect(summary.total).to.equal(12);
			});
		});

		describe('report by period', function () {
			before(function (done) {
				events.report({event: 'application started', report: 'period', from: '2013-09-29', to: '2013-09-30'}, function (err, sum) {
					error = err;
					summary = sum;
					done(err);
				});
			});

			it('should have event data', function () {
				expect(summary.id).to.equal('app-started');
				expect(summary.event).to.equal('application started');
			});

			it('should have total', function () {
				expect(summary.total).to.equal(12);
			});
		});
	});
});