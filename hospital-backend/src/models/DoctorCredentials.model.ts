import mongoose, { Document, Schema } from 'mongoose';

export interface IDoctorCredentials extends Document {
  id: number;
  doctorId: number; // References Doctor.id
  username: string;
  password: string; // Will be hashed with bcrypt
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
      unique: true, // One credential per doctor
      ref: 'Doctor' // Reference to Doctor model
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
    }
  },
  {
    timestamps: true
  }
);

// Indexes are already created by unique: true, no need to add manually

export default mongoose.model<IDoctorCredentials>('DoctorCredentials', DoctorCredentialsSchema);