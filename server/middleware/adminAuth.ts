import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { UserModel, IUserDocument } from '../models/User.js';
import { verifyAuthToken } from '../services/authToken.js';

export type AuthenticatedRequest = Request & { user?: IUserDocument };

export const verifyToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing or invalid authorization header' });
  const payload = verifyAuthToken(header.slice(7));
  if (!payload) return res.status(401).json({ error: 'Invalid or expired session token' });
  const user = await UserModel.findOne({ id: payload.userId });
  if (!user) return res.status(401).json({ error: 'Session user no longer exists' });
  req.user = user;
  next();
};

export const authorizeRoles = (...roles: string[]) => (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || !roles.includes(req.user.role)) return res.status(403).json({ error: 'Insufficient permissions' });
  next();
};

export const checkClubOwnership = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const clubId = String(req.params.clubId || req.body?.clubId || '');
  if (!clubId) return res.status(400).json({ error: 'clubId is required' });
  if (req.user?.role === 'college_admin' || req.user?.managedClubId === clubId) return next();
  return res.status(403).json({ error: 'You can only manage your assigned club' });
};

export const requireStepUpAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const password = req.body?.currentPassword;
  if (!password || !req.user?.passwordHash || !(await bcrypt.compare(password, req.user.passwordHash))) {
    return res.status(403).json({ error: 'Current password confirmation is required for this action' });
  }
  next();
};
