export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  experience: string;
  education: string;
  image: string;
  availableDays: string[];
  timeSlots?: TimeSlot[]; // Add this
  shortBio: string;
  consultationFee: string;
}

export interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
  display: string;
}