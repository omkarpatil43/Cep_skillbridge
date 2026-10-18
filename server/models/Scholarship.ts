import mongoose, { Schema, Document } from 'mongoose';

export interface IScholarshipDocument extends Document {
  id: string;
  title: string;
  provider: string;
  category: 'Merit-Based' | 'Need-Based / EWS' | 'Women in STEM' | 'Government Schemes' | 'Corporate CSR';
  amount: string;
  deadline: string;
  eligibleBranches: string[];
  eligibleYears: string[];
  cgpaCriteria: string;
  description: string;
  applicationLink: string;
  officialDriveLink: string;
  documentsRequired: string[];
  status: 'Open' | 'Closing Soon' | 'Upcoming';
}

const ScholarshipSchema = new Schema<IScholarshipDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    provider: { type: String, required: true },
    category: {
      type: String,
      enum: ['Merit-Based', 'Need-Based / EWS', 'Women in STEM', 'Government Schemes', 'Corporate CSR'],
      required: true,
      index: true,
    },
    amount: { type: String, required: true },
    deadline: { type: String, required: true },
    eligibleBranches: { type: [String], default: [] },
    eligibleYears: { type: [String], default: [] },
    cgpaCriteria: { type: String, default: 'None' },
    description: { type: String, default: '' },
    applicationLink: { type: String, default: '' },
    officialDriveLink: { type: String, default: '' },
    documentsRequired: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['Open', 'Closing Soon', 'Upcoming'],
      default: 'Open',
      index: true,
    },
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

export const ScholarshipModel = mongoose.model<IScholarshipDocument>('Scholarship', ScholarshipSchema);
