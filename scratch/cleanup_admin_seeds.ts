import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const uri = process.env.MONGO_URI;

async function cleanupAdminSeeds() {
  if (!uri) {
    console.error('MONGO_URI missing');
    process.exit(1);
  }

  await mongoose.connect(uri, { dbName: 'skillbridge' });
  const usersCollection = mongoose.connection.collection('users');

  // Delete u-3 and u-4 (or any admin/club_admin/college_admin)
  const deleteResult = await usersCollection.deleteMany({
    $or: [
      { id: { $in: ['u-3', 'u-4'] } },
      { role: { $in: ['college_admin', 'club_admin', 'admin'] } },
    ],
  });

  console.log(`Deleted ${deleteResult.deletedCount} admin seed documents from users collection.`);

  // Re-query remaining users
  const remainingUsers = await usersCollection.find({}).toArray();
  console.log(`\nRemaining Users (${remainingUsers.length} total):`);
  for (const u of remainingUsers) {
    console.log(`- ID: ${u.id} | Name: ${u.name} | Role: ${u.role}`);
  }

  // Check count of admin role users
  const adminCount = await usersCollection.countDocuments({
    role: { $in: ['college_admin', 'club_admin', 'admin'] },
  });

  console.log(`\nAdmin role count in database: ${adminCount}`);

  await mongoose.disconnect();
}

cleanupAdminSeeds().catch((err) => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});
