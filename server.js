const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 8080;

// MongoDB config
const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:admin@localhost:27017';
const MONGO_DB = process.env.MONGO_DB || 'demo';

let db;
const mongoClient = new MongoClient(MONGO_URI);
const MAX_RETRIES = 5;
const RETRY_DELAY = 3000; // milliseconds

app.use(express.json());

async function connectWithRetry() {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      await mongoClient.connect();
      db = mongoClient.db(MONGO_DB);
      console.log('✅ Connected to MongoDB');
      return;
    } catch (err) {
      console.error(`❌ MongoDB connection failed. Retry ${i + 1}/${MAX_RETRIES}...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
    }
  }
  console.error('❌ MongoDB connection failed after multiple retries.');
  process.exit(1); // Exit the process if connection fails after retries
}

connectWithRetry();

// Save data
app.post('/data', async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'Database connection not established' });
  }
  try {
    const payload = req.body;
    const result = await db.collection('logs').insertOne(payload);
    console.log(`[MongoDB] Inserted: ${result.insertedId}`);
    res.status(201).json({ message: 'Saved to MongoDB', id: result.insertedId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Insert failed' });
  }
});

// Get all data
app.get('/data', async (req, res) => {
  if (!db) {
    return res.status(503).json({ error: 'Database connection not established' });
  }
  try {
    const docs = await db.collection('logs').find().toArray();
    console.log('📥 Received /data request');
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Read failed' });
  }
});

app.get('/', (req, res) => {
  res.send('Hello from backend!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});