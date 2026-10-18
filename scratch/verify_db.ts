import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const uri = process.env.MONGO_URI;

async function checkDatabases() {
  if (!uri) {
    console.error('MONGO_URI missing');
    process.exit(1);
  }

  console.log('Connecting to Atlas...');
  await mongoose.connect(uri, { dbName: 'skillbridge' });

  const admin = mongoose.connection.db.admin();
  const dbs = await admin.listDatabases();
  console.log('Available Databases in Cluster:');
  for (const dbInfo of dbs.databases) {
    console.log(` - ${dbInfo.name} (sizeOnDisk: ${dbInfo.sizeOnDisk} bytes)`);
  }

  // Check skillbridge collections
  const sbDb = mongoose.connection.useDb('skillbridge');
  const sbCollections = await sbDb.db.listCollections().toArray();
  console.log('\nCollections in "skillbridge" database:');
  for (const col of sbCollections) {
    const count = await sbDb.collection(col.name).countDocuments();
    console.log(` - ${col.name}: ${count} documents`);
  }

  // Check test collections
  const testDb = mongoose.connection.useDb('test');
  const testCollections = await testDb.db.listCollections().toArray();
  console.log('\nCollections in "test" database:');
  for (const col of testCollections) {
    const count = await testDb.collection(col.name).countDocuments();
    console.log(` - ${col.name}: ${count} documents`);
  }

  await mongoose.disconnect();
}

checkDatabases().catch((err) => {
  console.error('Check failed:', err);
  process.exit(1);
});
