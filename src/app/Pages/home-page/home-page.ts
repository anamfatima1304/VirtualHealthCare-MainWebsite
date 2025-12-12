import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Doctors } from '../../Shared/doctors/doctors';
import { Departments } from '../../Shared/departments/departments';
import { CommonModule } from '@angular/common';
import { Doctor } from '../../Shared/Interfaces/Doctor.interface';
import { DoctorsService } from '../../Data/doctors.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-page',
  imports: [Departments, CommonModule],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit, OnDestroy {
  currentSlide = 0;
  intervalId: any;

  doctorList: Doctor[] = [];

  constructor(private doctorsService: DoctorsService, private router: Router) {}

  isPaused = false;

  pauseCarousel() {
    this.isPaused = true;
  }

  resumeCarousel() {
    this.isPaused = false;
  }

  hospitalImages = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=800&h=500&fit=crop',
      title: 'Modern Healthcare Facility',
      description: 'State-of-the-art medical equipment and comfortable patient areas',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&h=500&fit=crop',
      title: 'Patient Care Excellence',
      description: 'Dedicated staff providing compassionate healthcare services',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=800&h=500&fit=crop',
      title: 'Advanced Medical Technology',
      description: 'Cutting-edge diagnostic and treatment capabilities',
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=500&fit=crop',
      title: 'Emergency Care 24/7',
      description: 'Round-the-clock emergency services and critical care',
    },
    {
      id: 5,
      image: 'https://cdn.pixabay.com/photo/2016/11/08/05/29/operation-1807543_1280.jpg',
      title: 'Comfortable Recovery',
      description: 'Peaceful healing environment for patient recovery',
    },
  ];

  ngOnInit() {
    this.startAutoSlide();
    // Get doctors from service
    this.doctorList = this.doctorsService.doctors;
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  startAutoSlide() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.hospitalImages.length;
  }

  prevSlide() {
    this.currentSlide =
      this.currentSlide === 0 ? this.hospitalImages.length - 1 : this.currentSlide - 1;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }

  onDoctorClick(doctor: Doctor) {
    this.router.navigate(['/doctors/profile', doctor.id]);
  }

  goToAbout() {
    this.router.navigate(['/about']);
  }

  goToTests() {
    // console.log("Navigate to tests page");
    this.router.navigate(['/services']);
  }

  // @ViewChild('carousel', { static: false }) carousel!: ElementRef;

  // scroll(direction: number) {
  //   const cardWidth = 330; // card width + gap
  //   this.carousel.nativeElement.scrollBy({ left: direction * cardWidth, behavior: 'smooth' });
  // }
}
