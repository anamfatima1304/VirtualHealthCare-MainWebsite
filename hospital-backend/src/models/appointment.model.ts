// hospital-backend/src/models/Appointment.model.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IAppointment extends Document {
  id: number;
  doctorId: number;
  patientName: string;
  appointmentDate: Date;
  time: string;
  priority: 'High' | 'Medium' | 'Normal';
  status: 'pending' | 'confirmed' | 'Scheduled' | 'Completed' | 'Cancelled';
  reason?: string;
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
      ref: 'Doctor'
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
      enum: ['pending', 'confirmed', 'Scheduled', 'Completed', 'Cancelled'],
      default: 'pending'
    },
    // Added: optional reason field for priority-based booking
    reason: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// ✅ Guard against OverwriteModelError when nodemon hot-reloads
export default mongoose.models['Appointment']
  ? (mongoose.models['Appointment'] as mongoose.Model<IAppointment>)
  : mongoose.model<IAppointment>('Appointment', AppointmentSchema);