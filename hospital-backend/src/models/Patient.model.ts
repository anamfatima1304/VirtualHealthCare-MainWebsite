import mongoose, { Document, Schema } from 'mongoose';

export interface IPatient extends Document {
  userId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
}

const PatientSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String },
    phoneNumber: { type: String }
  },
  { timestamps: true }
);

// ✅ Reads from patient_db > patients collection (separate DB)
const patientDb = mongoose.connection.useDb('patient_db');
export default patientDb.model<IPatient>('Patient', PatientSchema, 'patients');