import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminInviteDocument extends Document {
  email: string;
  clubId: string;
  tokenHash: string;
  expiresAt: Date;
  usedAt?: Date;
  createdBy: string;
}

const AdminInviteSchema = new Schema<IAdminInviteDocument>({
  email: { type: String, required: true, index: true },
  clubId: { type: String, required: true, ref: 'Club' },
  tokenHash: { type: String, required: true, unique: true, index: true },
  expiresAt: { type: Date, required: true, index: true },
  usedAt: { type: Date },
  createdBy: { type: String, required: true, ref: 'User' },
}, { timestamps: true });

AdminInviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
export const AdminInviteModel = mongoose.model<IAdminInviteDocument>('AdminInvite', AdminInviteSchema);
