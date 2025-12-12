import { Component } from '@angular/core';
import { Doctors } from "../../Shared/doctors/doctors";

@Component({
  selector: 'app-doctors-page',
  imports: [Doctors],
  templateUrl: './doctors-page.html',
  styleUrl: './doctors-page.css'
})
export class DoctorsPage {

}
