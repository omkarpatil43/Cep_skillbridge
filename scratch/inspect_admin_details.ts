import 'dotenv/config';
import { connectDB } from '../server/config/db.js';
import { UserModel } from '../server/models/User.js';

async function inspectAdmin() {
  await connectDB();
  const admins = await UserModel.find({ role: 'college_admin' });
  console.log('Admins found:', JSON.stringify(admins, null, 2));
  process.exit(0);
}

inspectAdmin();
