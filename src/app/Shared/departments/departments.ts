import { Component, OnInit } from '@angular/core';
import { Department } from '../Interfaces/Department.interface';
import { CommonModule } from '@angular/common';
import { DepartmentService } from '../../Data/departments.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-departments',
  imports: [CommonModule],
  templateUrl: './departments.html',
  styleUrl: './departments.css',
})
export class Departments implements OnInit {
  
  departmentList: Department[] = [];
  constructor(private departmentServuce: DepartmentService, private router: Router){}

  ngOnInit(): void {
    // Load local data IMMEDIATELY
    this.departmentList = this.departmentServuce.departments;
    
    // Then try to fetch from backend (optional - only if backend is running)
    this.departmentServuce.getAllDepartments().subscribe({
      next: (departments: Department[]) => {
        console.log('Departments loaded from backend:', departments);
        this.departmentList = departments; // Update with backend data
      },
      error: (error: any) => {
        console.log('Backend not available, using local data');
        // Already have local data, so no problem
      }
    });
  }

  onDepartmentClick(department: Department) {
    this.router.navigate(['/doctors'], { queryParams: { department: department.name } });
  }

  getTotalSpecialists(): number {
    return this.departmentList.reduce((total, dept) => total + dept.specialists, 0);
  }
  
}