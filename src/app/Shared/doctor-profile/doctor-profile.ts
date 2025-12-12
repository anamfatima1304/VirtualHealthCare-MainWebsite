import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DoctorsService } from '../../Data/doctors.service';
import { Doctor } from '../Interfaces/Doctor.interface';
import { CommonModule } from '@angular/common';

interface TimeSlot {
  startTime: string;
  endTime: string;
  display: string;
  unavailable?: boolean;
}

@Component({
  selector: 'app-doctor-profile',
  imports: [CommonModule],
  templateUrl: './doctor-profile.html',
  styleUrl: './doctor-profile.css'
})
export class DoctorProfile implements OnInit {
  doctor: Doctor | null = null;
  selectedDay: string = '';
  selectedTimeSlot: TimeSlot | null = null;

  // All days of the week
  weekDays: string[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
    'Friday', 'Saturday', 'Sunday'
  ];

  // Time slots for each day
  availableTimeSlots: { [key: string]: TimeSlot[] } = {
    'Monday': [
      { startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
      { startTime: '14:00', endTime: '17:00', display: '2:00 PM - 5:00 PM' }
    ],
    'Tuesday': [
      { startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
      { startTime: '14:00', endTime: '17:00', display: '2:00 PM - 5:00 PM' }
    ],
    'Wednesday': [
      { startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
      { startTime: '15:00', endTime: '17:00', display: '3:00 PM - 5:00 PM' }
    ],
    'Thursday': [
      { startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
      { startTime: '14:00', endTime: '17:00', display: '2:00 PM - 5:00 PM' }
    ],
    'Friday': [
      { startTime: '09:00', endTime: '12:00', display: '9:00 AM - 12:00 PM' },
      { startTime: '15:00', endTime: '16:00', display: '3:00 PM - 4:00 PM' }
    ],
    'Saturday': [
      { startTime: '10:00', endTime: '13:00', display: '10:00 AM - 1:00 PM' }
    ],
    'Sunday': [] // No slots available on Sunday
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorsService: DoctorsService
  ) {}

  ngOnInit(): void {
    const doctorId = this.route.snapshot.paramMap.get('id');
    if (doctorId) {
      this.doctor = this.doctorsService.doctors.find(d => d.id === +doctorId) || null;
      if (this.doctor) {
        // Set first available day as selected by default
        const firstAvailableDay = this.weekDays.find(day => this.isDayAvailable(day));
        this.selectedDay = firstAvailableDay || '';
      }
    }

    if (!this.doctor) {
      // Redirect back to doctors list if doctor not found
      this.router.navigate(['/doctors']);
    }
  }

  isDayAvailable(day: string): boolean {
    return this.availableTimeSlots[day] && this.availableTimeSlots[day].length > 0;
  }

  getTimeSlotsForDay(day: string): TimeSlot[] {
    return this.availableTimeSlots[day] || [];
  }

  onDaySelect(day: string): void {
    if (this.isDayAvailable(day)) {
      this.selectedDay = day;
      this.selectedTimeSlot = null; // Reset selected time slot when changing day
    }
  }

  onTimeSlotSelect(timeSlot: TimeSlot): void {
    if (!timeSlot.unavailable) {
      this.selectedTimeSlot = timeSlot;
      console.log(`Selected time slot: ${timeSlot.display} on ${this.selectedDay}`);
      // TODO: Handle time slot selection for booking
    }
  }

  onBookAppointment(): void {
    console.log('Navigating to appointment booking page');
    // TODO: Navigate to booking page with doctor info
    // this.router.navigate(['/book-appointment', this.doctor?.id]);
    alert('Redirecting to appointment booking page...');
  }

  goBack(): void {
    this.router.navigate(['/doctors']);
  }

  generateStars(rating: number): string[] {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push('full');
    }
    if (hasHalfStar) {
      stars.push('half');
    }
    for (let i = 0; i < emptyStars; i++) {
      stars.push('empty');
    }

    return stars;
  }
}