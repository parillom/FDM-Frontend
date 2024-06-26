import {Component, HostBinding, OnInit, ViewChild} from '@angular/core';
import {MatSidenav} from '@angular/material/sidenav';
import {FormControl} from '@angular/forms';
import {OverlayContainer} from '@angular/cdk/overlay';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  isMenuOpen?: boolean = true;
  @ViewChild('sidenav') sidenav?: MatSidenav;

  switchTheme = new FormControl(false);
  @HostBinding('class') className = '';
  darkClass = 'theme-dark';
  lightClass = 'theme-light';

  constructor(private overlay: OverlayContainer) {
  }

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.className = savedTheme;
      this.switchTheme.setValue(savedTheme === this.darkClass);
      this.overlay.getContainerElement().classList.add(this.className);
    } else {
      this.overlay.getContainerElement().classList.add(this.lightClass);
    }

    this.switchTheme.valueChanges.subscribe((currentMode) => {
      this.className = currentMode ? this.darkClass : this.lightClass;
      localStorage.setItem('theme', this.className);
      this.overlay.getContainerElement().classList.remove(this.darkClass, this.lightClass);
      this.overlay.getContainerElement().classList.add(this.className);
    });
  }

  toggleTheme() {
    const isDarkMode = this.className === this.darkClass;
    this.switchTheme.setValue(!isDarkMode);
  }

  toggleAndRotate() {
    this.sidenav?.toggle();
    this.isMenuOpen = !this.isMenuOpen;
  }
}
