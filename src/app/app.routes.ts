import { Routes } from '@angular/router';
import { HomePage } from './Pages/home-page/home-page';
import { AboutPage } from './Pages/about-page/about-page';
import { DoctorsPage } from './Pages/doctors-page/doctors-page';
import { ServicePage } from './Pages/service-page/service-page';
import { ContactPage } from './Pages/contact-page/contact-page';
import { DoctorProfile } from './Shared/doctor-profile/doctor-profile';

export const routes: Routes = [
    {path: '', component: HomePage},
    {path: 'about', component: AboutPage},
    {path: 'doctors', component: DoctorsPage},
    {path: 'services', component: ServicePage},
    {path: 'contact', component: ContactPage},
    { path: 'doctors/profile/:id', component: DoctorProfile }
];
