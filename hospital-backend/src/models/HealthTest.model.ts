import mongoose, { Document, Schema } from 'mongoose';

export interface IHealthTest extends Document {
  id: number;
  name: string;
  price: number;
  department: string;
  availableTimeSlots: string[];
}

const HealthTestSchema: Schema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    department: {
      type: String,
      required: true,
      trim: true
    },
    availableTimeSlots: {
      type: [String],
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IHealthTest>('HealthTest', HealthTestSchema);