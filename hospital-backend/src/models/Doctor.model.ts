import mongoose, { Document, Schema } from 'mongoose';

export interface ITimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  display: string;
}

export interface IDoctor extends Document {
  id: number;
  name: string;
  specialty: string;
  experience: string;
  education: string;
  image: string;
  availableDays: string[];
  timeSlots: ITimeSlot[];
  shortBio: string;
  consultationFee: string;
}

const TimeSlotSchema = new Schema({
  day: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  display: {
    type: String,
    required: true
  }
}, { _id: false });

const DoctorSchema: Schema = new Schema(
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
    specialty: {
      type: String,
      required: true,
      trim: true
    },
    experience: {
      type: String,
      required: true
    },
    education: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    availableDays: {
      type: [String],
      required: true
    },
    timeSlots: {
      type: [TimeSlotSchema],
      default: []
    },
    shortBio: {
      type: String,
      required: true
    },
    consultationFee: {
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IDoctor>('Doctor', DoctorSchema);