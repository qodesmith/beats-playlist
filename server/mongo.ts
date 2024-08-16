import {MongoClient} from 'mongodb'

const {MONGO_USER, MONGO_PASSWORD, MONGO_HOST, MONGO_PORT} = Bun.env
const mongoUrl = `mongodb://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_HOST}:${MONGO_PORT}`

let mongoClient: MongoClient

export async function genMongoClient(): Promise<MongoClient> {
  if (mongoClient) return mongoClient

  const client = new MongoClient(mongoUrl, {family: 4})
  await client.connect()
  mongoClient = client

  return client
}
