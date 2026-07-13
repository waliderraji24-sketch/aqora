import { MongoClient } from 'mongodb';

let cachedClient: MongoClient | null = null;

function getMongoUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return 'mongodb://127.0.0.1:27017/aqora';
  }
  return uri;
}

export default async function connectMongo() {
  if (cachedClient) {
    return cachedClient;
  }

  try {
    const client = new MongoClient(getMongoUri());
    await client.connect();
    cachedClient = client;
    return client;
  } catch (error) {
    console.warn('MongoDB unavailable, using fallback mode:', error);
    return null as unknown as MongoClient;
  }
}
