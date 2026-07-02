import { MongoClient } from 'mongodb';

let cachedClient: MongoClient | null = null;

function getMongoUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }
  return uri;
}

export default async function connectMongo() {
  if (cachedClient) {
    return cachedClient;
  }

  const client = new MongoClient(getMongoUri());
  await client.connect();
  cachedClient = client;
  return client;
}
