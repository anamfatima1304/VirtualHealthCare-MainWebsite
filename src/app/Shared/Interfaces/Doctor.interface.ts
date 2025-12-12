export interface Doctor {
  id: number;
  name: string;
  specialty: string;
  experience: string;
  education: string;
  image: string;
  availableDays: string[];
  shortBio: string;
  consultationFee: string;
}