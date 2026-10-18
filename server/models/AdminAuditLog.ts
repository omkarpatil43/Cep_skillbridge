import mongoose, { Document, Schema } from 'mongoose';

export interface IAdminAuditLogDocument extends Document {
  actorId: string;
  actionType: 'PROMOTE_USER' | 'REVOKE_ADMIN' | 'INVITE_SENT' | 'INVITE_ACCEPTED';
  targetUserId?: string;
  details: Record<string, unknown>;
  createdAt: Date;
}

const AdminAuditLogSchema = new Schema<IAdminAuditLogDocument>({
  actorId: { type: String, required: true, ref: 'User', immutable: true },
  actionType: { type: String, enum: ['PROMOTE_USER', 'REVOKE_ADMIN', 'INVITE_SENT', 'INVITE_ACCEPTED'], required: true, immutable: true },
  targetUserId: { type: String, ref: 'User', immutable: true },
  details: { type: Schema.Types.Mixed, default: {}, immutable: true },
}, { timestamps: { createdAt: true, updatedAt: false } });

// No update/delete routes are exposed: audit records are append-only by API design.
export const AdminAuditLogModel = mongoose.model<IAdminAuditLogDocument>('AdminAuditLog', AdminAuditLogSchema);
