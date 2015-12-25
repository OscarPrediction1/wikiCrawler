var winston = require('winston');
winston.add(winston.transports.File, { filename: 'log.log' });
// winston.handleExceptions(new winston.transports.File({ filename: 'exceptions.log' }))
module.exports = winston;