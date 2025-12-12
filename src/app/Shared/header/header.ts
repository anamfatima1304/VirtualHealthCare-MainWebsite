import { Component } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']  // fixed from styleUrl -> styleUrls
})
export class Header {
  isMenuOpen = false;

  constructor(public router: Router) {
    // Automatically close mobile menu on route change
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isMenuOpen = false;
      });
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  isActive(url: string) {
    return this.router.isActive(url, {
      paths: 'exact',
      queryParams: 'ignored',
      fragment: 'ignored',
      matrixParams: 'ignored'
    });
  }
}
