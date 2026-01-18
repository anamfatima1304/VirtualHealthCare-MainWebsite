import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema: Schema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);