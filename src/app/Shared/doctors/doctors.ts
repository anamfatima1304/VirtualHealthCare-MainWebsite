import { Component, OnDestroy, OnInit } from '@angular/core';
import { Doctor } from '../Interfaces/Doctor.interface';
import { Department } from '../Interfaces/Department.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DoctorsService } from '../../Data/doctors.service';
import { DepartmentService } from '../../Data/departments.service';
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
  departmentList: Department[] = [];
  searchTerm: string = '';
  selectedDepartment: string = '';
  departments: string[] = [];
  loading: boolean = false;
  private queryParamSub?: Subscription;

  constructor(
    private doctorsService: DoctorsService,
    private departmentService: DepartmentService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Load doctors and departments
    this.loadDoctors();
    this.loadDepartments();

    // Subscribe to query params for department filtering
    this.queryParamSub = this.route.queryParams.subscribe((params: { [x: string]: any }) => {
      const department = params['department'];
      if (department) {
        this.selectedDepartment = department;
        this.applyFilters();
      }
    });
  }

  private loadDoctors(): void {
    // Load local data immediately
    this.doctorList = this.doctorsService.doctors;
    this.filteredDoctors = [...this.doctorList];

    // Try to fetch from backend
    this.loading = true;
    this.doctorsService.getAllDoctors().subscribe({
      next: (doctors) => {
        console.log('Doctors loaded from backend:', doctors);
        this.doctorList = doctors;
        this.filteredDoctors = [...this.doctorList];
        this.extractDepartmentsFromDoctors();
        this.loading = false;
        
        // Reapply filters if department was selected
        if (this.selectedDepartment) {
          this.applyFilters();
        }
      },
      error: (error) => {
        console.log('Backend not available for doctors, using local data');
        this.extractDepartmentsFromDoctors();
        this.loading = false;
      }
    });
  }

  private loadDepartments(): void {
    // Load local data immediately
    this.departmentList = this.departmentService.departments;
    this.extractDepartmentsFromBackend();

    // Fetch from backend
    this.departmentService.getAllDepartments().subscribe({
      next: (departments) => {
        console.log('Departments loaded from backend:', departments);
        this.departmentList = departments;
        this.extractDepartmentsFromBackend();
      },
      error: (error) => {
        console.log('Backend not available for departments, using local data');
        this.extractDepartmentsFromBackend();
      }
    });
  }

  private extractDepartmentsFromDoctors(): void {
    // Extract unique departments from doctors' specialties
    const doctorDepartments = [...new Set(this.doctorList.map(doctor => doctor.specialty))].sort();
    
    // Merge with existing departments (avoid duplicates)
    this.departments = [...new Set([...this.departments, ...doctorDepartments])].sort();
  }

  private extractDepartmentsFromBackend(): void {
    // Extract department names from department list
    const backendDepartments = this.departmentList.map(dept => dept.name).sort();
    
    // Merge with existing departments (avoid duplicates)
    this.departments = [...new Set([...this.departments, ...backendDepartments])].sort();
  }

  onDoctorClick(doctor: Doctor): void {
    console.log('Clicked on doctor:', doctor.name);
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