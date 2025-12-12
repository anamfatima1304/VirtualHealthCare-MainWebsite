import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { HealthTest } from '../../Shared/Interfaces/Tests.interface';
import { HealthcareTest } from '../../Data/tests.service';

@Component({
  selector: 'app-service-page',
  imports: [CommonModule],
  templateUrl: './service-page.html',
  styleUrl: './service-page.css'
})
export class ServicePage implements OnInit {

  healthcareTests: HealthTest[] = [];
  loading: boolean = false;

  constructor(private testService: HealthcareTest) {}

  ngOnInit(): void {
    // Load local data immediately
    this.healthcareTests = this.testService.healthcareTests;
    
    // Try to fetch from backend
    this.loading = true;
    this.testService.getAllTests().subscribe({
      next: (tests: HealthTest[]) => {
        console.log('Tests loaded from backend:', tests);
        this.healthcareTests = tests;
        this.loading = false;
      },
      error: () => {
        console.log('Backend not available, using local data');
        this.loading = false;
      }
    });
  }
}