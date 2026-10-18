import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const uri = process.env.MONGO_URI;

async function checkUsers() {
  if (!uri) {
    console.error('MONGO_URI missing');
    process.exit(1);
  }

  await mongoose.connect(uri, { dbName: 'skillbridge' });

  const users = await mongoose.connection.collection('users').find({}).toArray();
  console.log(`Found ${users.length} users in skillbridge.users:`);
  for (const u of users) {
    console.log(`- ID: ${u.id || u._id} | Name: ${u.name} | Email: ${u.email} | Role: ${u.role} | AdminStatus: ${u.adminStatus || 'N/A'}`);
  }

  await mongoose.disconnect();
}

checkUsers().catch((err) => {
  console.error('Error checking users:', err);
  process.exit(1);
});
