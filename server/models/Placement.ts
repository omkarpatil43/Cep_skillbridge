import mongoose, { Schema, Document } from 'mongoose';

export interface IPlacementDocument extends Document {
  id: string;
  name: string;
  logo: string;
  tier: 'Dream (20+ LPA)' | 'Super Dream (12-20 LPA)' | 'Standard (6-12 LPA)' | 'Mass / Service (3.5-6 LPA)';
  packageLPA: string;
  eligibleBranches: string[];
  hiringRounds: string[];
  prepRoadmapLink: string;
  driveLink: string;
  overview: string;
  importantTopics: string[];
  recentInterviewExperiences: {
    studentName: string;
    batch: string;
    role: string;
    roundDetails: string;
    tips: string;
  }[];
}

const PlacementSchema = new Schema<IPlacementDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    logo: { type: String, default: '' },
    tier: {
      type: String,
      enum: ['Dream (20+ LPA)', 'Super Dream (12-20 LPA)', 'Standard (6-12 LPA)', 'Mass / Service (3.5-6 LPA)'],
      default: 'Standard (6-12 LPA)',
      index: true,
    },
    packageLPA: { type: String, required: true },
    eligibleBranches: { type: [String], default: [] },
    hiringRounds: { type: [String], default: [] },
    prepRoadmapLink: { type: String, default: '' },
    driveLink: { type: String, default: '' },
    overview: { type: String, default: '' },
    importantTopics: { type: [String], default: [] },
    recentInterviewExperiences: [
      {
        studentName: { type: String },
        batch: { type: String },
        role: { type: String },
        roundDetails: { type: String },
        tips: { type: String },
      },
    ],
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

export const PlacementModel = mongoose.model<IPlacementDocument>('Placement', PlacementSchema);
