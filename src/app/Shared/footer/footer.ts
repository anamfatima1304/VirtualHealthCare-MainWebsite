import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Router } from 'express';

@Component({
  selector: 'app-footer',
  imports: [RouterModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class Footer {
  currentYear = new Date().getFullYear();
}
