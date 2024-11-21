import {MongoClient} from 'mongodb'

const {MONGO_USER, MONGO_PASSWORD, MONGO_HOST, MONGO_PORT} = process.env
const mongoUrl = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}`

/**
 * https://www.mongodb.com/docs/drivers/node/current/fundamentals/connection/connect/#std-label-node-connect-to-mongodb
 *
 * No need to call `await mongoClient.connect()` as the Node.js driver
 * automatically calls the MongoClient.connect() method when using the client to
 * perform CRUD operations.
 */
const mongoClient = new MongoClient(mongoUrl, {family: 4})

export const db = mongoClient.db('beats-playlist')
