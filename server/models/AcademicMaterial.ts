import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '../../src/types';

export interface IAcademicMaterialDocument extends Document {
  id: string;
  title: string;
  branch: string;
  semester: number;
  subject: string;
  type: 'drive' | 'pdf' | 'pyq' | 'notes' | 'syllabus' | 'video' | 'lab';
  description: string;
  link: string;
  authorName: string;
  authorRole: UserRole;
  authorRollNo?: string;
  dateAdded: string;
  downloadsCount: number;
  tags: string[];
}

const AcademicMaterialSchema = new Schema<IAcademicMaterialDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    branch: { type: String, required: true, index: true },
    semester: { type: Number, required: true, index: true },
    subject: { type: String, required: true, index: true },
    type: { 
      type: String, 
      enum: ['drive', 'pdf', 'pyq', 'notes', 'syllabus', 'video', 'lab'],
      default: 'drive' 
    },
    description: { type: String, default: '' },
    link: { type: String, required: true },
    authorName: { type: String, default: 'Senior Mentor' },
    authorRole: { type: String, enum: ['junior', 'senior', 'club_admin', 'college_admin', 'admin', 'student'], default: 'senior' },
    authorRollNo: { type: String },
    dateAdded: { type: String, default: () => new Date().toISOString().split('T')[0] },
    downloadsCount: { type: Number, default: 0 },
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

export const AcademicMaterialModel = mongoose.model<IAcademicMaterialDocument>(
  'AcademicMaterial',
  AcademicMaterialSchema
);
