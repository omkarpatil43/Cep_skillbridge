import mongoose, { Schema, Document } from 'mongoose';
import { DoubtReply } from '../../src/types';

export interface IDoubtDocument extends Document {
  id: string;
  title: string;
  description: string;
  codeSnippet?: string;
  branch: string;
  subject: string;
  authorName: string;
  authorRole: 'student' | 'senior' | 'club_admin' | 'admin';
  authorRollNo: string;
  date: string;
  tags: string[];
  upvotes: number;
  solved: boolean;
  replies: DoubtReply[];
}

const DoubtReplySchema = new Schema<DoubtReply>(
  {
    id: { type: String, required: true },
    authorName: { type: String, required: true },
    authorRole: { type: String, enum: ['junior', 'senior', 'club_admin', 'college_admin', 'admin', 'student'], default: 'student' },
    authorRollNo: { type: String, default: '24CS000' },
    content: { type: String, required: true },
    codeSnippet: { type: String },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    isSeniorVerified: { type: Boolean, default: false },
    upvotes: { type: Number, default: 0 },
  },
  { _id: false }
);

const DoubtSchema = new Schema<IDoubtDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    codeSnippet: { type: String },
    branch: { type: String, default: 'Computer Science & Engg', index: true },
    subject: { type: String, required: true, index: true },
    authorName: { type: String, default: 'Student' },
    authorRole: { type: String, enum: ['junior', 'senior', 'club_admin', 'college_admin', 'admin', 'student'], default: 'student' },
    authorRollNo: { type: String, default: '24CS000' },
    date: { type: String, default: () => new Date().toISOString().split('T')[0] },
    tags: { type: [String], default: [] },
    upvotes: { type: Number, default: 0 },
    solved: { type: Boolean, default: false, index: true },
    replies: { type: [DoubtReplySchema], default: [] },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret: Record<string, any>) => {
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const DoubtModel = mongoose.model<IDoubtDocument>('Doubt', DoubtSchema);
