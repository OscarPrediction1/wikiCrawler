exports.mysql = {
    host: process.env.MYSQL_HOST || 'HOST',
	database: process.env.MYSQL_DATABASE || 'DB',
    user: process.env.MYSQL_USER || 'USER',
    password: process.env.MYSQL_PASSWORD || 'PW'
};