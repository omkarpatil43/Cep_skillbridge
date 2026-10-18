import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'node:crypto';
import { UserModel } from '../models/User.js';
import { createAuthToken } from '../services/authToken.js';
import { db } from '../db.js';

export const setupRouter = Router();

const getAuthSecret = () => process.env.AUTH_SECRET || 'default-fallback-secret';

const createSetupToken = (): string => {
  const payload = Buffer.from(
    JSON.stringify({
      purpose: 'admin_setup',
      exp: Math.floor(Date.now() / 1000) + 15 * 60, // 15 minutes TTL
    })
  ).toString('base64url');
  const signature = crypto
    .createHmac('sha256', getAuthSecret())
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
};

const verifySetupToken = (token: string): boolean => {
  if (!token) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return false;
  const expected = crypto
    .createHmac('sha256', getAuthSecret())
    .update(payload)
    .digest('base64url');
  if (signature.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      purpose?: string;
      exp?: number;
    };
    return (
      parsed.purpose === 'admin_setup' &&
      typeof parsed.exp === 'number' &&
      parsed.exp > Math.floor(Date.now() / 1000)
    );
  } catch {
    return false;
  }
};

/**
 * GET /api/setup/status
 * Returns whether a college_admin already exists in the system.
 */
setupRouter.get('/status', async (_req: Request, res: Response) => {
  try {
    let existingAdmin: any = null;
    try {
      existingAdmin = await UserModel.findOne({
        role: { $in: ['college_admin', 'admin'] },
      });
    } catch {
      // MongoDB query failed, fall back to persistent local store
    }
    if (!existingAdmin) {
      existingAdmin = db.findUser(u => u.role === 'college_admin' || (u.role as string) === 'admin');
    }
    return res.json({ hasAdmin: !!existingAdmin });
  } catch (error) {
    console.error('Error checking setup status:', error);
    return res.json({ hasAdmin: false });
  }
});

/**
 * POST /api/setup/verify-key
 * Validates SETUP_ACCESS_KEY and issues a short-lived setup token.
 */
setupRouter.post('/verify-key', async (req: Request, res: Response) => {
  try {
    const existingAdmin = await UserModel.findOne({
      role: { $in: ['college_admin', 'admin'] },
    });
    if (existingAdmin) {
      return res.status(403).json({
        success: false,
        error: 'A college administrator account already exists. Setup wizard is locked.',
      });
    }

    const { accessKey } = req.body;
    const expectedKey = process.env.SETUP_ACCESS_KEY;

    if (!expectedKey) {
      return res.status(500).json({
        success: false,
        error: 'SETUP_ACCESS_KEY is not configured on the server.',
      });
    }

    if (!accessKey || typeof accessKey !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Setup Access Key is required.',
      });
    }

    const accessKeyBuf = Buffer.from(accessKey.trim());
    const expectedKeyBuf = Buffer.from(expectedKey.trim());

    if (
      accessKeyBuf.length !== expectedKeyBuf.length ||
      !crypto.timingSafeEqual(accessKeyBuf, expectedKeyBuf)
    ) {
      return res.status(401).json({
        success: false,
        error: 'Invalid Setup Access Key.',
      });
    }

    const setupToken = createSetupToken();
    return res.json({
      success: true,
      setupToken,
      message: 'Setup Access Key verified. Token issued (valid for 15 minutes).',
    });
  } catch (error) {
    console.error('Error verifying setup key:', error);
    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
});

/**
 * POST /api/setup/create-admin
 * Validates setup token and creates the initial college_admin account.
 */
setupRouter.post('/create-admin', async (req: Request, res: Response) => {
  try {
    const { setupToken, name, email, password, branch } = req.body;

    if (!setupToken || typeof setupToken !== 'string' || !verifySetupToken(setupToken)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired setup token. Please re-enter your Setup Access Key.',
      });
    }

    let existingAdmin: any = null;
    try {
      existingAdmin = await UserModel.findOne({
        role: { $in: ['college_admin', 'admin'] },
      });
    } catch {
      // fallback
    }
    if (!existingAdmin) {
      existingAdmin = db.findUser(u => u.role === 'college_admin' || (u.role as string) === 'admin');
    }
    if (existingAdmin) {
      return res.status(403).json({
        success: false,
        error: 'A college administrator account already exists.',
      });
    }

    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'Valid full name is required.' });
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Valid email address is required.' });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters long.',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    let existingUser: any = null;
    try {
      existingUser = await UserModel.findOne({ email: normalizedEmail });
    } catch {
      // fallback
    }
    if (!existingUser) {
      existingUser = db.findUser(u => u.email.toLowerCase() === normalizedEmail);
    }
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'An account with this email already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const adminUserData = {
      id: `usr_admin_${Date.now()}`,
      name: name.trim(),
      email: normalizedEmail,
      rollNo: 'ADMIN-001',
      passwordHash,
      role: 'college_admin' as const,
      adminStatus: 'Active' as const,
      isApproved: true,
      verificationStatus: 'Verified' as const,
      branch: branch || 'Academic Directorate',
      year: 'Faculty / Admin',
      badges: ['Institute Admin', 'College Administrator'],
      reputation: 999,
    };

    db.saveUser(adminUserData);
    try {
      await UserModel.create(adminUserData);
    } catch {
      // ignore
    }

    const authToken = createAuthToken(adminUserData);

    return res.status(201).json({
      success: true,
      message: 'College Administrator account successfully created! You can now log in.',
      user: adminUserData,
      token: authToken,
    });
  } catch (error) {
    console.error('Error creating initial admin:', error);
    return res.status(500).json({ success: false, error: 'Failed to create admin account.' });
  }
});
