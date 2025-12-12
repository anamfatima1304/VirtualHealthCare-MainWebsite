import { Injectable } from '@angular/core';
import { Doctor } from '../Shared/Interfaces/Doctor.interface';

@Injectable({
  providedIn: 'root'
})
export class DoctorsService {
  doctors: Doctor[] = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      experience: '15 years',
      education: 'MD, Harvard Medical School',
      image:
        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
      availableDays: ['Monday', 'Wednesday', 'Friday'],
      shortBio: 'Specialist in cardiovascular diseases with extensive experience in heart surgery.',
      consultationFee: '$200',
    },
    {
      id: 2,
      name: 'Dr. Michael Chen',
      specialty: 'Neurologist',
      experience: '12 years',
      education: 'MD, Johns Hopkins University',
      image:
        'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
      availableDays: ['Tuesday', 'Thursday', 'Saturday'],
      shortBio: 'Expert in treating neurological disorders and brain-related conditions.',
      consultationFee: '$180',
    },
    {
      id: 3,
      name: 'Dr. Emily Rodriguez',
      specialty: 'Pediatrician',
      experience: '10 years',
      education: 'MD, Stanford University',
      image:
        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=face',
      availableDays: ['Monday', 'Tuesday', 'Thursday'],
      shortBio: 'Dedicated to providing comprehensive healthcare for children and adolescents.',
      consultationFee: '$150',
    },
    {
      id: 4,
      name: 'Dr. Robert Wilson',
      specialty: 'Orthopedic Surgeon',
      experience: '18 years',
      education: 'MD, Mayo Clinic',
      image:
        'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400&h=400&fit=crop&crop=face',
      availableDays: ['Wednesday', 'Friday', 'Saturday'],
      shortBio: 'Specializes in joint replacement and sports medicine injuries.',
      consultationFee: '$220',
    },
    {
      id: 5,
      name: 'Dr. Lisa Thompson',
      specialty: 'Dermatologist',
      experience: '8 years',
      education: 'MD, UCLA Medical School',
      image:
        'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=face',
      availableDays: ['Monday', 'Wednesday', 'Friday'],
      shortBio: 'Expert in skin conditions, cosmetic procedures, and dermatological surgery.',
      consultationFee: '$160',
    },
    {
      id: 6,
      name: 'Dr. David Kumar',
      specialty: 'General Surgeon',
      experience: '14 years',
      education: 'MD, Yale Medical School',
      image:
        'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&h=400&fit=crop&crop=face',
      availableDays: ['Tuesday', 'Thursday', 'Saturday'],
      shortBio: 'Skilled in minimally invasive surgical techniques and emergency procedures.',
      consultationFee: '$190',
    },
  ];
}
