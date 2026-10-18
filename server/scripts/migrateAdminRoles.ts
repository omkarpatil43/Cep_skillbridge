import 'dotenv/config';
import { connectDB } from '../config/db.js';
import { UserModel } from '../models/User.js';

if (!await connectDB()) throw new Error('Database connection failed');
const result = await UserModel.updateMany(
  { role: 'admin' },
  { $set: { role: 'college_admin', isApproved: true, adminStatus: 'Active' }, $unset: { managedClubId: '' } },
);
console.log(`Migrated ${result.modifiedCount} legacy admin account(s) to college_admin.`);
process.exit(0);
