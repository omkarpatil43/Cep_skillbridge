import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function resetTestAdmin() {
  const uri = process.env.MONGO_URI;
  if (!uri) process.exit(1);

  await mongoose.connect(uri, { dbName: 'skillbridge' });
  const res = await mongoose.connection.collection('users').deleteMany({
    role: { $in: ['college_admin', 'admin', 'club_admin'] },
  });
  console.log(`Reset test admin: Deleted ${res.deletedCount} admin users. System is back to hasAdmin: false.`);
  await mongoose.disconnect();
}

resetTestAdmin().catch(console.error);
