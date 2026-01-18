import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Feedback {
  id?: number;
  name: string;
  email: string;
  message: string;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private apiUrl = 'http://localhost:3000/api/feedback';

  constructor(private http: HttpClient) {}

  createFeedback(feedback: Feedback): Observable<Feedback> {
    return this.http.post<{ success: boolean; data: Feedback }>(this.apiUrl, feedback)
      .pipe(map((response) => response.data));
  }

  getAllFeedback(): Observable<Feedback[]> {
    return this.http.get<{ success: boolean; data: Feedback[] }>(this.apiUrl)
      .pipe(map((response) => response.data));
  }

  getFeedbackById(id: number): Observable<Feedback> {
    return this.http.get<{ success: boolean; data: Feedback }>(`${this.apiUrl}/${id}`)
      .pipe(map((response) => response.data));
  }

  updateFeedback(id: number, feedback: Feedback): Observable<Feedback> {
    return this.http.put<{ success: boolean; data: Feedback }>(`${this.apiUrl}/${id}`, feedback)
      .pipe(map((response) => response.data));
  }

  deleteFeedback(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}