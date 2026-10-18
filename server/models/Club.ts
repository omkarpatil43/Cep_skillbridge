import mongoose, { Schema, Document } from 'mongoose';
import { ClubEvent } from '../../src/types';

export interface IClubDocument extends Document {
  id: string;
  name: string;
  category: 'Technical' | 'Cultural' | 'Entrepreneurship' | 'Sports' | 'Social & Community';
  tagline: string;
  description: string;
  logo: string;
  banner: string;
  leadName: string;
  leadRole: string;
  leadEmail: string;
  leadPhone: string;
  recruitmentOpen: boolean;
  memberCount: number;
  socialLinks: {
    instagram?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  events: ClubEvent[];
}

const ClubEventSchema = new Schema<ClubEvent>(
  {
    id: { type: String, required: true },
    clubId: { type: String, required: true },
    title: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, default: '10:00 AM IST' },
    venue: { type: String, required: true },
    description: { type: String, default: '' },
    bannerImage: { type: String, default: '' },
    registrationLink: { type: String },
    registrationOpen: { type: Boolean, default: true },
    registeredCount: { type: Number, default: 0 },
    tags: { type: [String], default: [] },
  },
  { _id: false }
);

const ClubSchema = new Schema<IClubDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['Technical', 'Cultural', 'Entrepreneurship', 'Sports', 'Social & Community'],
      required: true,
      index: true,
    },
    tagline: { type: String, default: '' },
    description: { type: String, default: '' },
    logo: { type: String, default: '' },
    banner: { type: String, default: '' },
    leadName: { type: String, default: '' },
    leadRole: { type: String, default: '' },
    leadEmail: { type: String, default: '' },
    leadPhone: { type: String, default: '' },
    recruitmentOpen: { type: Boolean, default: true },
    memberCount: { type: Number, default: 0 },
    socialLinks: {
      instagram: { type: String },
      linkedin: { type: String },
      github: { type: String },
      website: { type: String },
    },
    events: { type: [ClubEventSchema], default: [] },
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

export const ClubModel = mongoose.model<IClubDocument>('Club', ClubSchema);
