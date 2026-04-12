import mongoose, { Document, Schema } from 'mongoose';

export interface IDoctorCredentials extends Document {
  id: number;
  doctorId: number;
  username: string;
  password: string;
  email: string;        // ✅ NEW
  createdAt?: Date;
  updatedAt?: Date;
}

const DoctorCredentialsSchema: Schema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true
    },
    doctorId: {
      type: Number,
      required: true,
      unique: true,
      ref: 'Doctor'
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    email: {                    // ✅ NEW
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IDoctorCredentials>('DoctorCredentials', DoctorCredentialsSchema);