import { Component, OnDestroy, OnInit } from '@angular/core';
import { Doctor } from '../Interfaces/Doctor.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorsService } from '../../Data/doctors.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-doctors',
  imports: [CommonModule, FormsModule],
  templateUrl: './doctors.html',
  styleUrl: './doctors.css',
})
export class Doctors implements OnInit, OnDestroy {
  doctorList: Doctor[] = [];
  filteredDoctors: Doctor[] = [];
  searchTerm: string = '';
  selectedDepartment: string = '';
  departments: string[] = [];
  private queryParamSub?: Subscription;

  constructor(
      private doctorsService: DoctorsService,
      private router: Router,
      private route: ActivatedRoute   
    ) {}

  ngOnInit(): void {
    // Get doctors from service
    this.doctorList = this.doctorsService.doctors;
    this.filteredDoctors = [...this.doctorList];
    
    // Extract unique departments from doctors' specialties
    this.departments = [...new Set(this.doctorList.map(doctor => doctor.specialty))].sort();

    this.queryParamSub = this.route.queryParams.subscribe((params: { [x: string]: any; }) => {
    const department = params['department'];
    if (department) {
      this.selectedDepartment = department;
      this.applyFilters();
    }
  });
  }

  onDoctorClick(doctor: Doctor) {
    console.log('Clicked on doctor:', doctor.name);
    // TODO: Navigate to doctor detail component
    this.router.navigate(['/doctors/profile', doctor.id]);
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onDepartmentChange(): void {
    this.applyFilters();
  }

  private applyFilters(): void {
    this.filteredDoctors = this.doctorList.filter(doctor => {
      const matchesSearch = doctor.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           doctor.specialty.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
                           doctor.education.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesDepartment = this.selectedDepartment === '' || 
                               doctor.specialty === this.selectedDepartment;
      
      return matchesSearch && matchesDepartment;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedDepartment = '';
    this.filteredDoctors = [...this.doctorList];
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

  ngOnDestroy(): void {
    this.queryParamSub?.unsubscribe();
  }
}