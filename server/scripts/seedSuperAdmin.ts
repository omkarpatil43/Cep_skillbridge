import 'dotenv/config';
import bcrypt from 'bcrypt';
import { connectDB } from '../config/db.js';
import { UserModel } from '../models/User.js';

const email = process.env.SUPER_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.SUPER_ADMIN_PASSWORD;
if (!email || !password) throw new Error('SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be set');
if (password.length < 10 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) throw new Error('SUPER_ADMIN_PASSWORD must be 10+ characters with upper/lower case, number, and symbol');
if (!await connectDB()) throw new Error('Database connection failed');
if (await UserModel.exists({ role: 'college_admin' })) throw new Error('A college_admin already exists; refusing to create a duplicate root administrator');
await UserModel.create({ id: `college-admin-${Date.now()}`, name: 'SkillBridge College Administrator', email, passwordHash: await bcrypt.hash(password, 12), branch: 'College Administration', year: 'Faculty Administrator', role: 'college_admin', isApproved: true, adminStatus: 'Active', verificationStatus: 'Verified' });
console.log(`Created root college administrator: ${email}`);
process.exit(0);
