module.exports.mysql = {
    host: process.env.MYSQL_HOST || 'localhost',
	database: process.env.MYSQL_DATABASE || 'oscars',
    user: process.env.MYSQL_USER || 'oscars',
    password: process.env.MYSQL_PASSWORD || 'oscars'
};