import mongoose, { Document, Schema } from 'mongoose';

export interface IDepartment extends Document {
  id: number;
  name: string;
  description: string;
  icon: string;
  services: string[];
  specialists: number;
}

const DepartmentSchema: Schema = new Schema(
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
    description: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    services: {
      type: [String],
      required: true
    },
    specialists: {
      type: Number,
      required: true,
      default: 1
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IDepartment>('Department', DepartmentSchema);