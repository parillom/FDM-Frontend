import {Component, OnInit, ViewChild} from '@angular/core';
import {MatSidenav} from '@angular/material/sidenav';
import {ActivatedRoute, NavigationEnd, Router} from '@angular/router';
import {MatDialog} from '@angular/material/dialog';
import {SettingsComponent} from '../settings/settings.component';
import {ScreenSizeService} from '../../../services/screen-size.service';

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
  @ViewChild('sidenav') sidenav: MatSidenav | undefined;
  isScreenSmall: boolean = false;

  constructor(private router: Router,
              private route: ActivatedRoute,
              private dialog: MatDialog,
              private screenSizeService: ScreenSizeService) {
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
    sessionStorage.removeItem('settingsOpen');

    this.screenSizeService.isScreenExtraSmall$.subscribe(isSmall => {
      this.isScreenSmall = isSmall;
    });
  }

  setCurrentObjectName(name: string): void {
    this.objectName = name;
  }

  private getPageNameFromUrl(url: string): string {
    if (url === '/fdm/dashboard') {
      return 'Dashboard';
    } else if (url === '/fdm/dashboard/vehicle' || url.includes('/fdm/dashboard/vehicle/edit')) {
        return 'Fahrzeuge';
    } else if (url === '/fdm/dashboard/location' || url.includes('/fdm/dashboard/location/edit')) {
      return 'Orte';
    } else {
      return '';
    }
  }

  toggleAndRotate() {
    void this.sidenav?.toggle();
    this.sidenavOpen = !this.sidenavOpen;
  }

  navigateToDashboard() {
    window.location.href = 'fdm/dashboard';
  }

  navigateToVehicle() {
    window.location.href = 'fdm/dashboard/vehicle';
  }

  navigateToLocation() {
    window.location.href = 'fdm/dashboard/location';
  }

  openSettings() {
    if (!sessionStorage.getItem('settingsOpen')) {
      this.dialog.open(SettingsComponent, {
        hasBackdrop: false,
        autoFocus: false,
        width: '400px',
        height: 'auto'
      });
      sessionStorage.setItem('settingsOpen', 'opened');
    } else {
      sessionStorage.removeItem('settingsOpen');
      this.dialog.closeAll();
    }
  }
}
