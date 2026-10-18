import mongoose, { Schema, Document } from 'mongoose';

export interface IAttachment {
  id: string;
  name: string;
  type: 'image' | 'video' | 'pdf' | 'doc' | 'audio' | 'other';
  url: string;
  size: number;
  mimeType: string;
}

export interface IChatMessageDocument extends Document {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderYear: string;
  text: string;
  attachments: IAttachment[];
  reactions: Record<string, string[]>;
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    type: {
      type: String,
      enum: ['image', 'video', 'pdf', 'doc', 'audio', 'other'],
      default: 'other',
    },
    url: { type: String, required: true },
    size: { type: Number, default: 0 },
    mimeType: { type: String, default: 'application/octet-stream' },
  },
  { _id: false }
);

const ChatMessageSchema = new Schema<IChatMessageDocument>(
  {
    id: { type: String, required: true, unique: true, index: true },
    roomId: { type: String, required: true, index: true },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, default: 'student' },
    senderYear: { type: String, default: '1st Year' },
    text: { type: String, default: '' },
    attachments: { type: [AttachmentSchema], default: [] },
    reactions: { type: Schema.Types.Mixed, default: {} },
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

export const ChatMessageModel = mongoose.model<IChatMessageDocument>(
  'ChatMessage',
  ChatMessageSchema
);
