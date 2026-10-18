import mongoose, { Schema, Document } from 'mongoose';
import type { UserRole, StudentLevel, VerificationStatus } from '../../src/types/index.js';

export interface IUserDocument extends Document {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  passwordHash?: string;
  branch: string;
  year: string;
  role: UserRole;
  avatar?: string;
  clubName?: string;
  bio?: string;
  badges: string[];
  reputation: number;
  // ── ID Verification fields ──
  batchStartYear?: number;
  batchEndYear?: number;
  yearOfStudy?: number;
  studentLevel?: StudentLevel;
  verificationStatus: VerificationStatus;
  ocrConfidenceScore?: number;
  idCardImageRef?: string;
  idCardHash?: string;
  verifiedAt?: Date;
  // ── Login security ──
  loginAttempts: number;
  lockedUntil?: Date;
  managedClubId?: string;
  isApproved: boolean;
  createdBy?: string;
  adminStatus: 'Active' | 'Pending' | 'Revoked';
}

const UserSchema = new Schema<IUserDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    // Admins are not students and therefore do not have a roll number.
    rollNo: { type: String, unique: true, sparse: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String },
    branch: { type: String, default: 'Computer Science & Engg' },
    year: { type: String, default: '1st Year (Fresher)' },
    role: { type: String, enum: ['junior', 'student', 'senior', 'club_admin', 'college_admin', 'admin'], default: 'student' },
    managedClubId: { type: String, ref: 'Club', default: null },
    isApproved: { type: Boolean, default: true },
    createdBy: { type: String, ref: 'User', default: null },
    adminStatus: { type: String, enum: ['Active', 'Pending', 'Revoked'], default: 'Pending' },
    avatar: { type: String },
    clubName: { type: String },
    bio: { type: String },
    badges: { type: [String], default: [] },
    reputation: { type: Number, default: 0 },
    // ── ID Verification ──
    batchStartYear: { type: Number },
    batchEndYear: { type: Number },
    yearOfStudy: { type: Number },
    studentLevel: {
      type: String,
      enum: ['Fresher', 'SecondYear', 'ThirdYear', 'FinalYear', 'Alumni', 'Invalid'],
    },
    verificationStatus: {
      type: String,
      enum: ['Verified', 'Pending', 'Rejected'],
      default: 'Verified',     // Legacy/seed users are auto-verified
    },
    ocrConfidenceScore: { type: Number },
    idCardImageRef: { type: String },
    idCardHash: { type: String, index: true },
    verifiedAt: { type: Date },
    // ── Login security ──
    loginAttempts: { type: Number, default: 0 },
    lockedUntil: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, unknown>) => {
        // Strip sensitive fields from any API response
        delete ret._id;
        delete ret.__v;
        delete ret.passwordHash;
        delete ret.idCardImageRef;
        delete ret.idCardHash;
        delete ret.loginAttempts;
        delete ret.lockedUntil;
        return ret;
      },
    },
  }
);

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);
