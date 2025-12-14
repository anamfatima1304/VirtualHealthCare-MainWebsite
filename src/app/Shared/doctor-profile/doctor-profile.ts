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
  loading: boolean = false;

  // All days of the week
  weekDays: string[] = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 
    'Friday', 'Saturday', 'Sunday'
  ];

  // Dynamic time slots based on doctor's available days
  availableTimeSlots: { [key: string]: TimeSlot[] } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private doctorsService: DoctorsService
  ) {}

  ngOnInit(): void {
    const doctorId = this.route.snapshot.paramMap.get('id');
    if (doctorId) {
      this.loadDoctor(+doctorId);
    } else {
      this.router.navigate(['/doctors']);
    }
  }

  private loadDoctor(doctorId: number): void {
    // Load from local data first (immediate display)
    this.doctor = this.doctorsService.doctors.find(d => d.id === doctorId) || null;
    
    if (this.doctor) {
      this.generateTimeSlotsForDoctor(this.doctor);
      this.initializeSelectedDay();
    }

    // Fetch from backend
    this.loading = true;
    this.doctorsService.getDoctorById(doctorId).subscribe({
      next: (doctor) => {
        console.log('Doctor loaded from backend:', doctor);
        this.doctor = doctor;
        this.generateTimeSlotsForDoctor(doctor);
        this.initializeSelectedDay();
        this.loading = false;
      },
      error: (error) => {
        console.log('Backend not available, using local data');
        this.loading = false;
        
        // If no local data found either, redirect
        if (!this.doctor) {
          this.router.navigate(['/doctors']);
        }
      }
    });
  }

  private generateTimeSlotsForDoctor(doctor: Doctor): void {
    // Reset time slots
    this.availableTimeSlots = {};

    // If doctor has timeSlots from backend, use them
    if (doctor.timeSlots && doctor.timeSlots.length > 0) {
      // Group time slots by day from backend data
      this.weekDays.forEach(day => {
        this.availableTimeSlots[day] = doctor.timeSlots!
          .filter(slot => slot.day === day)
          .map(slot => ({
            startTime: slot.startTime,
            endTime: slot.endTime,
            display: slot.display,
            unavailable: false
          }));
      });
    } else {
      // Fallback: Generate time slots based on availableDays only
      this.weekDays.forEach(day => {
        if (doctor.availableDays.includes(day)) {
          this.availableTimeSlots[day] = this.getDefaultTimeSlotsForDay(day);
        } else {
          this.availableTimeSlots[day] = [];
        }
      });
    }
  }

  private getDefaultTimeSlotsForDay(day: string): TimeSlot[] {
    // Default time slots (fallback only if backend data missing)
    const timeSlots: { [key: string]: TimeSlot[] } = {
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
      'Sunday': []
    };

    return timeSlots[day] || [];
  }

  private initializeSelectedDay(): void {
    if (this.doctor) {
      // Set first available day as selected by default
      const firstAvailableDay = this.weekDays.find(day => this.isDayAvailable(day));
      this.selectedDay = firstAvailableDay || '';
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
}