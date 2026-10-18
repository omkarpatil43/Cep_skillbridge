import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const uri = process.env.MONGO_URI;

async function migrate() {
  if (!uri) {
    console.error('MONGO_URI missing');
    process.exit(1);
  }

  console.log('Connecting to Atlas...');
  await mongoose.connect(uri, { dbName: 'skillbridge' });

  const testDb = mongoose.connection.useDb('test');
  const sbDb = mongoose.connection.useDb('skillbridge');

  const testCollections = await testDb.db.listCollections().toArray();
  console.log('Migrating collections from "test" to "skillbridge"...');

  for (const col of testCollections) {
    const docs = await testDb.collection(col.name).find({}).toArray();
    if (docs.length > 0) {
      console.log(`Copying ${docs.length} docs from test.${col.name} to skillbridge.${col.name}...`);
      await sbDb.collection(col.name).deleteMany({});
      await sbDb.collection(col.name).insertMany(docs);
    } else {
      // Ensure collection exists
      await sbDb.db.createCollection(col.name).catch(() => {});
    }
  }

  console.log('\nDropping database "test"...');
  await testDb.db.dropDatabase();

  console.log('\nVerifying "skillbridge" database collections:');
  const sbCols = await sbDb.db.listCollections().toArray();
  for (const col of sbCols) {
    const count = await sbDb.collection(col.name).countDocuments();
    console.log(` ✅ skillbridge.${col.name}: ${count} documents`);
  }

  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
