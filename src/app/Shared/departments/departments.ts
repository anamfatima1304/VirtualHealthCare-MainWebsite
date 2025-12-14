import { Component, OnInit } from '@angular/core';
import { Department } from '../Interfaces/Department.interface';
import { Doctor } from '../Interfaces/Doctor.interface';
import { CommonModule } from '@angular/common';
import { DepartmentService } from '../../Data/departments.service';
import { DoctorsService } from '../../Data/doctors.service';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-departments',
  imports: [CommonModule],
  templateUrl: './departments.html',
  styleUrl: './departments.css',
})
export class Departments implements OnInit {
  
  departmentList: Department[] = [];
  doctorList: Doctor[] = [];
  
  constructor(
    private departmentService: DepartmentService,
    private doctorsService: DoctorsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // Load local data immediately
    this.departmentList = this.departmentService.departments;
    this.doctorList = this.doctorsService.doctors;
    
    // Calculate specialist count from local data
    this.updateSpecialistCounts();
    
    // Fetch from backend
    forkJoin({
      departments: this.departmentService.getAllDepartments(),
      doctors: this.doctorsService.getAllDoctors()
    }).subscribe({
      next: (data) => {
        console.log('Data loaded from backend:', data);
        this.departmentList = data.departments;
        this.doctorList = data.doctors;
        
        // Calculate specialist count from backend data (same as admin panel)
        this.updateSpecialistCounts();
      },
      error: (error) => {
        console.log('Backend not available, using local data');
        // Already have local data with calculated counts
      }
    });
  }

  // Calculate specialist count for each department (same as admin panel)
  updateSpecialistCounts(): void {
    this.departmentList.forEach(dept => {
      dept.specialists = this.getSpecialistCount(dept.name);
    });
  }

  // Count doctors for a given department (same as admin panel)
  getSpecialistCount(departmentName: string): number {
    return this.doctorList.filter(
      doctor => doctor.specialty === departmentName
    ).length;
  }

  onDepartmentClick(department: Department) {
    this.router.navigate(['/doctors'], { queryParams: { department: department.name } });
  }

  getTotalSpecialists(): number {
    return this.departmentList.reduce((total, dept) => total + dept.specialists, 0);
  }
}