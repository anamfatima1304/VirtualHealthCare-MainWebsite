import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { FeedbackService, Feedback } from '../../Data/feedback.service';

@Component({
  selector: 'app-contact-page',
  imports: [FormsModule, CommonModule],
  templateUrl: './contact-page.html',
  styleUrl: './contact-page.css',
})
export class ContactPage {
  isSubmitting = false;
  submitSuccess = false;
  submitError = false;
  errorMessage = '';

  constructor(private feedbackService: FeedbackService) {}

  submitForm(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.submitSuccess = false;
    this.submitError = false;

    const feedbackData: Feedback = {
      name: form.value.name,
      email: form.value.email,
      message: form.value.message
    };

    this.feedbackService.createFeedback(feedbackData).subscribe({
      next: (response) => {
        console.log('Feedback submitted successfully:', response);
        this.isSubmitting = false;
        this.submitSuccess = true;
        form.reset(); // Reset the form
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          this.submitSuccess = false;
        }, 5000);
      },
      error: (error) => {
        console.error('Error submitting feedback:', error);
        this.isSubmitting = false;
        this.submitError = true;
        this.errorMessage = error.error?.message || 'Failed to submit feedback. Please try again.';
        
        // Hide error message after 5 seconds
        setTimeout(() => {
          this.submitError = false;
        }, 5000);
      }
    });
  }
}