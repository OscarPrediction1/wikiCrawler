exports.mongodb = {
    host: process.env.MONGODB_HOST || 'bitnami-meanstack-1842.cloudapp.net',
    port: process.env.MONGODB_PORT || '27017',
    user: process.env.MONGODB_USER || 'oscar',
    database: process.env.MONGODB_DATABASE || 'oscar',
    password: process.env.MONGODB_PASSWORD || console.error('Please provide Password in env variable MONGODB_PASSWORD')
};
exports.mongodb.uri = 'mongodb://' + exports.mongodb.user + ':' + exports.mongodb.password + '@' + exports.mongodb.host + ':' + exports.mongodb.port + '/' + exports.mongodb.database;