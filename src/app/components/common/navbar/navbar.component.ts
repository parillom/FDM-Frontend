import {Component, HostBinding, OnInit, ViewChild} from '@angular/core';
import {MatSidenav} from '@angular/material/sidenav';
import {FormControl} from '@angular/forms';
import {OverlayContainer} from '@angular/cdk/overlay';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  sidenavOpen?: boolean = true;
  pageName: string = '';
  uuId?: number;
  url: string = '';
  @ViewChild('sidenav') sidenav?: MatSidenav;

  switchTheme = new FormControl(false);
  @HostBinding('class') className = '';
  darkClass = 'theme-dark';
  lightClass = 'theme-light';

  constructor(private overlay: OverlayContainer,
              private router: Router,
              private route: ActivatedRoute) {
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

    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const url = event.urlAfterRedirects;
        this.url = url;
        this.pageName = this.getPageNameFromUrl(url);
      }
    });

    this.route.queryParams.subscribe(params => {
      this.uuId = params['id'];
    });
  }

  private getPageNameFromUrl(url: string): string {
    if (url === '/fdm/dashboard') {
      return 'Dashboard';
    } else if (url === '/fdm/dashboard/vehicle' || url.includes('/fdm/dashboard/vehicle/edit')) {
        return 'Fahrzeuge'
    } else if (this.uuId !== null && this.uuId !== undefined) {
      return this.uuId.toString();
    } else {
      return '';
    }
  }

  toggleAndRotate() {
    this.sidenav?.toggle();
    this.sidenavOpen = !this.sidenavOpen;
  }

  navigateToDashboard() {
    window.location.href = 'fdm/dashboard';
  }

  navigateToVehicle() {
    window.location.href = 'fdm/dashboard/vehicle';
  }
}
