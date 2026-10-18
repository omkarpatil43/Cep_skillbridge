import 'dotenv/config';
import bcrypt from 'bcrypt';
import { connectDB } from '../server/config/db.js';
import { UserModel } from '../server/models/User.js';

async function setAdminPassword() {
  await connectDB();
  const email = 'admin@pict.edu';
  const password = 'AdminPassword123!';
  const hash = await bcrypt.hash(password, 10);

  const admin = await UserModel.findOneAndUpdate(
    { email },
    {
      passwordHash: hash,
      isApproved: true,
      adminStatus: 'Active',
      verificationStatus: 'Verified',
      role: 'college_admin',
    },
    { new: true, upsert: true }
  );

  console.log('Successfully set password for College Admin:');
  console.log('Email:', admin.email);
  console.log('Password:', password);
  console.log('Role:', admin.role);
  console.log('Status:', admin.adminStatus);
  process.exit(0);
}

setAdminPassword();
