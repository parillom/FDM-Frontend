import {Component, ViewChild} from '@angular/core';
import {MatSidenav} from '@angular/material/sidenav';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  isMenuOpen: boolean = false;
  @ViewChild('sidenav') sidenav?: MatSidenav;

  toggleAndRotate() {
    this.sidenav?.toggle();
    this.isMenuOpen = !this.isMenuOpen;
  }

}
