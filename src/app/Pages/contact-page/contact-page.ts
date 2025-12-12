import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

// Declare google to avoid TypeScript errors
declare var google: any;

@Component({
  selector: 'app-contact-page',
  imports: [FormsModule, CommonModule, ReactiveFormsModule],
  templateUrl: './contact-page.html',
  styleUrl: './contact-page.css',
})
export class ContactPage {
  submitForm() {
    alert('Thank you for your feedback!');
  }
}
