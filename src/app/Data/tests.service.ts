import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HealthTest } from '../Shared/Interfaces/Tests.interface';

@Injectable({
  providedIn: 'root'
})
export class HealthcareTest {
  private apiUrl = 'http://localhost:3000/api/health-tests';
  
  // Keep local data as fallback
  private localTests: HealthTest[] = [
    {
      id: 1,
      name: 'Complete Blood Count (CBC)',
      price: 25,
      department: 'Hematology',
      availableTimeSlots: ['Morning 8-11 AM', 'Afternoon 2-5 PM']
    },
    {
      id: 2,
      name: 'Chest X-Ray',
      price: 80,
      department: 'Radiology',
      availableTimeSlots: ['Morning 9-12 PM', 'Evening 3-6 PM']
    },
    {
      id: 3,
      name: 'Lipid Profile',
      price: 35,
      department: 'Biochemistry',
      availableTimeSlots: ['Morning 8-11 AM', 'Afternoon 1-4 PM', 'Evening 5-7 PM']
    },
    {
      id: 4,
      name: 'ECG (Electrocardiogram)',
      price: 45,
      department: 'Cardiology',
      availableTimeSlots: ['Morning 9-12 PM', 'Afternoon 2-5 PM']
    },
    {
      id: 5,
      name: 'Thyroid Function Test',
      price: 55,
      department: 'Endocrinology',
      availableTimeSlots: ['Morning 8-10 AM', 'Late Morning 10-12 PM']
    },
    {
      id: 6,
      name: 'Ultrasound Abdomen',
      price: 120,
      department: 'Radiology',
      availableTimeSlots: ['Morning 10-12 PM', 'Afternoon 2-4 PM', 'Evening 4-6 PM']
    },
    {
      id: 7,
      name: 'Blood Sugar Test',
      price: 15,
      department: 'Biochemistry',
      availableTimeSlots: ['Morning 8-11 AM', 'Afternoon 2-5 PM']
    },
    {
      id: 8,
      name: 'Urine Analysis',
      price: 20,
      department: 'Pathology',
      availableTimeSlots: ['Morning 8-12 PM', 'Afternoon 1-5 PM']
    }
  ];

  constructor(private http: HttpClient) {}

  // Get local tests synchronously (for backward compatibility)
  get healthcareTests(): HealthTest[] {
    return this.localTests;
  }

  // Get all tests from API (with local fallback)
  getAllTests(): Observable<HealthTest[]> {
    return this.http.get<{ success: boolean; data: HealthTest[] }>(this.apiUrl)
      .pipe(
        map((response: { data: any; }) => response.data),
        catchError((error: any) => {
          console.warn('API not available, using local data', error);
          return of(this.localTests);
        })
      );
  }

  // Get test by ID
  getTestById(id: number): Observable<HealthTest> {
    return this.http.get<{ success: boolean; data: HealthTest }>(`${this.apiUrl}/${id}`)
      .pipe(
        map((response: { data: any; }) => response.data),
        catchError((error: any) => {
          console.warn('API not available, using local data', error);
          const test = this.localTests.find(t => t.id === id);
          return of(test!);
        })
      );
  }

  // Get tests by department
  getTestsByDepartment(department: string): Observable<HealthTest[]> {
    return this.http.get<{ success: boolean; data: HealthTest[] }>(`${this.apiUrl}/department/${department}`)
      .pipe(
        map((response: { data: any; }) => response.data),
        catchError((error: any) => {
          console.warn('API not available, using local data', error);
          const tests = this.localTests.filter(t => 
            t.department.toLowerCase() === department.toLowerCase()
          );
          return of(tests);
        })
      );
  }

  // Create new test
  createTest(test: HealthTest): Observable<HealthTest> {
    return this.http.post<{ success: boolean; data: HealthTest }>(this.apiUrl, test)
      .pipe(map((response: { data: any; }) => response.data));
  }

  // Update test
  updateTest(id: number, test: HealthTest): Observable<HealthTest> {
    return this.http.put<{ success: boolean; data: HealthTest }>(`${this.apiUrl}/${id}`, test)
      .pipe(map((response: { data: any; }) => response.data));
  }

  // Delete test
  deleteTest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}