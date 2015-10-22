var appDir = './app/';
var config = require(appDir + 'config.js');
var films = require(appDir + 'films.js');

parseArguments();

function parseArguments() {
	var args = process.argv.slice(2); //Ersten beiden sind rubbish
	args.forEach(function(arg) {
		if (arg === 'films') {
			films.start(2014);
		}
	});
}