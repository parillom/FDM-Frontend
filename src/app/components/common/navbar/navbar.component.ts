import {Component, OnInit, ViewChild} from '@angular/core';
import {MatSidenav} from '@angular/material/sidenav';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {SettingsComponent} from '../settings/settings.component';

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
  objectName: string | null = '';
  @ViewChild('sidenav') sidenav?: MatSidenav;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private dialog: MatDialog) {
  }

  ngOnInit() {
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

  setCurrentObjectName(name: string) {
    this.objectName = name;
  }

  private getPageNameFromUrl(url: string): string {
    if (url === '/fdm/dashboard') {
      return 'Dashboard';
    } else if (url === '/fdm/dashboard/vehicle' || url.includes('/fdm/dashboard/vehicle/edit')) {
        return 'Fahrzeuge'
    } else if (url === '/fdm/dashboard/location' || url.includes('/fdm/dashboard/location/edit')) {
      return 'Orte'
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

  openSettings() {
    this.dialog.open(SettingsComponent, {
      hasBackdrop: false,
      autoFocus: false,
      width: '400px',
      height: '400px'
    });
  }
}
