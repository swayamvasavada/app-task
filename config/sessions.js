const mongodbStore = require('connect-mongodb-session');

let mongoUrl = 'mongodb://localhost:27017';

if (process.env.MONGO_URL) {
    mongoUrl = process.env.MONGO_URL;
}

function createSessionStore(session) {
    const MongoDBStore = mongodbStore(session);

    const sessionStore = new MongoDBStore({
        uri: mongoUrl,
        databaseName: 'app-task',
        collection: 'sessions'
    });

    return sessionStore;
}

function createSessionConfig(sessionStore) {
    return {
        secret: 'super-secret',
        resave: false,
        saveUninitialized: false,
        store: sessionStore,
        cookie: {
            maxAge: 2 * 24 * 60 * 60 * 1000
        }
    };
}

module.exports = {
    createSessionStore: createSessionStore,
    createSessionConfig: createSessionConfig
}