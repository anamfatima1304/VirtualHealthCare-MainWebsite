import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  id: number;
  doctorId: number; // References Doctor.id (the numeric ID)
  patientName: string;
  appointmentDate: Date;
  time: string;
  priority: 'High' | 'Medium' | 'Normal';
  // Updated status to include 'pending' and 'confirmed' to match your dashboard buttons
  status: 'pending' | 'confirmed' | 'Scheduled' | 'Completed' | 'Cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

const AppointmentSchema: Schema = new Schema(
  {
    id: {
      type: Number,
      required: true,
      unique: true
    },
    doctorId: {
      type: Number,
      required: true,
      ref: 'Doctor' // Ensure your Doctor model is also registered as 'Doctor'
    },
    patientName: {
      type: String,
      required: true
    },
    appointmentDate: {
      type: Date,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    priority: {
      type: String,
      enum: ['High', 'Medium', 'Normal'],
      default: 'Normal',
      required: true
    },
    status: {
      type: String,
      // Added 'pending' and 'confirmed' so the database accepts the updates from your buttons
      enum: ['pending', 'confirmed', 'Scheduled', 'Completed', 'Cancelled'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

// This ensures MongoDB creates the 'appointments' collection
export default mongoose.model<IAppointment>('Appointment', AppointmentSchema);