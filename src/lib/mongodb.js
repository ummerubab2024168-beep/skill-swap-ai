import { MongoClient } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}

const uri = process.env.MONGODB_URI;
let client;
let clientPromise;

if (process.env.NODE_ENV === 'development') {
  // Development mode mein connection ko global variable mein save rakhein
  if (!global._mongoClient) {
    global._mongoClient = new MongoClient(uri);
  }
  clientPromise = global._mongoClient.connect();
} else {
  // Production mode mein ek normal client banayein
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

export default clientPromise;