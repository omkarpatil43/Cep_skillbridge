import 'dotenv/config';
import { connectDB } from '../server/config/db.js';
import { UserModel } from '../server/models/User.js';

async function checkAdmins() {
  await connectDB();
  const admins = await UserModel.find({ role: { $in: ['college_admin', 'club_admin'] } });
  console.log('Found Admin Accounts:', admins.length);
  admins.forEach(a => {
    console.log(`- Email: ${a.email} | Role: ${a.role} | AdminStatus: ${a.adminStatus} | Name: ${a.name}`);
  });
  process.exit(0);
}

checkAdmins();
