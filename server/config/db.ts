import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'node:path';
import dns from 'node:dns';

try {
  dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);
} catch {
  // ignore if restricted
}

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });
console.log(`Loading environment from: ${envPath}`);

const MONGODB_URI = process.env.MONGO_URI || 'mongodb+srv://cluster0.e2l2eso.mongodb.net/skillbridge';



export const connectDB = async (): Promise<boolean> => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, { dbName: 'skillbridge' });
    console.log(`ÃƒÂ°Ã…Â¸Ã…â€™Ã‚Â¿ MongoDB Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
    console.log('MongoDB connection established.');
    return true;
  } catch (error) {
    // Never log the driver error object/message: it can include a connection URI.
    const dbError = error as { name?: string; code?: string; message?: string };
    const errorSignature = `${dbError.name || ''} ${dbError.code || ''} ${dbError.message || ''}`;
    const sanitizedMsg = (dbError.message || '').replace(/mongodb(\+srv)?:\/\/[^\s]+/gi, '[REDACTED_URI]');
    if (/querysrv|etimeout|enotfound|dns/i.test(errorSignature)) {
      console.error(`MongoDB DNS SRV lookup failed [${dbError.name || 'Error'}]: ${sanitizedMsg}`);
    } else if (/auth|authentication|bad auth/i.test(errorSignature)) {
      console.error(`MongoDB authentication failed [${dbError.name || 'Error'}]: ${sanitizedMsg}`);
    } else {
      console.error(`MongoDB connection failed [${dbError.name || 'Error'}${dbError.code ? ' Code:' + dbError.code : ''}]: ${sanitizedMsg}`);
    }
    return false;
  }
};
