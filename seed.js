const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://admin:admin@localhost:27017';
const MONGO_DB = process.env.MONGO_DB || 'demo';

const seedData = [
  { source: 'seed', message: 'Log A', timestamp: new Date() },
  { source: 'seed', message: 'Log B', timestamp: new Date() }
];

async function seed({ nuke = false } = {}) {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB for seeding');
    const db = client.db(MONGO_DB);
    const collection = db.collection('logs');

    if (nuke) {
      console.log('🔥 Nuking logs collection...');
      await collection.deleteMany({});
    }

    console.log('🌱 Seeding data...');
    await collection.insertMany(seedData);
    console.log('✅ Seeding complete');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  } finally {
    await client.close();
  }
}

// Run from CLI: `node seed.js` or `NUKE=true node seed.js`
if (require.main === module) {
  const nuke = process.env.NUKE === 'true';
  seed({ nuke });
}

module.exports = seed;
