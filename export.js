var connection = require('./app/db');
var path = require('path');
var log = require('./app/log');
var fs = require('fs');
var csvWriter = require('csv-write-stream');
var argv = require('yargs')
	.usage('Usage: export.js <command>')
    .command('bigquery', 'Export for bigquery')
	.command('timeseries', 'Export for using as time series in knime')
    .demand(1)
    .describe('where', 'SQL-WHERE Query')
    .argv;
	
var firstArg = argv._[0];

if (firstArg === 'bigquery') {
	bigquery();
}

if (firstArg === 'timeseries') {
	timeseries();
}

function getParameters(file) {
	var filename = argv.filename || __dirname + path.sep + file;
	var separator = argv.separator || ',';
	var delimiter = argv.delimiter || '"';
	var escaper = argv.escaper || '\\';
	var rowSeparator = argv.rowSeparator || '\n'
	return [filename, separator, delimiter, escaper, rowSeparator];
}

function runQuery(query, parameters, callback) {
	connection.query(query, parameters, function(err, rows) {
		if (err) {
			log.log('error', err);
			connection.end()
			return;
		}
		
		if (callback) {
			return callback(err, rows);
		}
		
		connection.end();
	});
}

function getExportQueryFragment() {
	var query = " INTO OUTFILE ? "
	query += "FIELDS TERMINATED BY ? OPTIONALLY ENCLOSED BY ? "
	query += "ESCAPED BY ? "
	query += "LINES TERMINATED BY ? "
	return query;
}

function bigquery() {
	var parameters = getParameters('wiki_views_for_bigquery.csv');
	try {
		fs.unlinkSync(parameters[0]);
	} catch (e) {}
	
	var query = "SELECT * ";
	query += getExportQueryFragment();
    var where = argv.where || "1";
	query += "FROM wiki_views WHERE " + where;

	runQuery(query, parameters);
}

function timeseries() {	
	var parameters = getParameters('wiki_views_timeseries_data.csv');
	try {
		fs.unlinkSync(parameters[0]);
	} catch (e) {}
	parameters[2] = '';
	parameters[3] = '';
	
	var query = "SELECT date, GROUP_CONCAT(views ORDER BY boxOfficeId) ";
	query += getExportQueryFragment();
    var where = argv.where || "1";
	query += "FROM wiki_views WHERE " + where + " GROUP BY date";
	
	runQuery(query, parameters, function() {
		var data = fs.readFileSync(parameters[0]);
		
		var pathToFile = __dirname + path.sep + 'wiki_views_timeseries.csv';
		try {
			fs.unlinkSync(pathToFile);
		} catch (e) {}
		connection.query('SELECT boxOfficeId FROM wiki_views GROUP BY boxOfficeId', function(err, rows) {
			fs.appendFileSync(pathToFile, 'date');
			for (var i in rows) {
				var row = rows[i];
				fs.appendFileSync(pathToFile, ',' + row.boxOfficeId);
			}
			fs.appendFileSync(pathToFile, '\n');
			fs.appendFileSync(pathToFile, data);
			fs.unlinkSync(parameters[0]);
			connection.end();
		});
	});
}