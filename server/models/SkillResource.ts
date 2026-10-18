import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '../../src/types';

export interface ISkillResourceDocument extends Document {
  id: string;
  title: string;
  category: 'Web Dev' | 'AI & ML' | 'Cloud & DevOps' | 'Cybersecurity' | 'App Dev' | 'Data Science' | 'Core Engineering';
  type: 'video' | 'drive' | 'pdf' | 'link' | 'roadmap' | 'repo';
  description: string;
  link: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration?: string;
  authorName: string;
  authorRole: UserRole;
  dateAdded: string;
  rating: number;
  tags: string[];
}

const SkillResourceSchema = new Schema<ISkillResourceDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['Web Dev', 'AI & ML', 'Cloud & DevOps', 'Cybersecurity', 'App Dev', 'Data Science', 'Core Engineering'],
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['video', 'drive', 'pdf', 'link', 'roadmap', 'repo'],
      default: 'roadmap',
    },
    description: { type: String, default: '' },
    link: { type: String, required: true },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
      index: true,
    },
    duration: { type: String, default: '4 Weeks' },
    authorName: { type: String, default: 'SkillBridge Mentor' },
    authorRole: { type: String, enum: ['junior', 'senior', 'club_admin', 'college_admin', 'admin', 'student'], default: 'senior' },
    dateAdded: { type: String, default: () => new Date().toISOString().split('T')[0] },
    rating: { type: Number, default: 5.0 },
    tags: { type: [String], default: [] },
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

export const SkillResourceModel = mongoose.model<ISkillResourceDocument>(
  'SkillResource',
  SkillResourceSchema
);
