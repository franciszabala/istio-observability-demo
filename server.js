const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 8080;

// MongoDB config
const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:admin@localhost:27017';
const MONGO_DB = process.env.MONGO_DB || 'demo';

let db;

app.use(express.json());

MongoClient.connect(MONGO_URI, { useUnifiedTopology: true })
  .then(client => {
    console.log('✅ Connected to MongoDB');
    db = client.db(MONGO_DB);
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err);
  });

// Save data
app.post('/data', async (req, res) => {
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
  try {
    const docs = await db.collection('logs').find().toArray();
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Read failed' });
  }
});

app.get('/', (req, res) => {
  console.log(`[GET /] Request received from ${req.ip}`);
  res.send('Hello from backend!');
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
