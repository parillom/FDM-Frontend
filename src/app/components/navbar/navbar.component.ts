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
            if (savedTheme === this.darkClass) {
                this.switchTheme.setValue(true);
            }
        } else {
            this.className = this.lightClass;
        }

        this.switchTheme.valueChanges.subscribe((currentMode) => {
            this.className = currentMode ? this.darkClass : this.lightClass;
            localStorage.setItem('theme', this.className);
            if (currentMode) {
                this.overlay.getContainerElement().classList.add(this.darkClass);
            } else {
                this.overlay.getContainerElement().classList.add(this.lightClass);
            }
        });
    }

    toggleAndRotate() {
      this.sidenav?.toggle();
      this.isMenuOpen = !this.isMenuOpen;
    }
}
