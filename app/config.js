exports.mongodb = {
    host: process.env.MONGODB_HOST || '23.102.28.222',
    port: process.env.MONGODB_PORT || '27017',
    user: process.env.MONGODB_USER || 'oscar',
    database: process.env.MONGODB_DATABASE || 'oscar',
    password: process.env.MONGODB_PASSWORD || console.error('Please provide Password in env variable MONGODB_PASSWORD')
};
exports.mongodb.uri = 'mongodb://' + exports.mongodb.user + ':' + exports.mongodb.password + '@' + exports.mongodb.host + ':' + exports.mongodb.port + '/' + exports.mongodb.database;