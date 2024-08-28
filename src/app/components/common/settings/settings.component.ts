import {Component, HostBinding, HostListener, OnInit} from '@angular/core';
import {FormControl} from '@angular/forms';
import {OverlayContainer} from '@angular/cdk/overlay';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent implements OnInit {

  switchTheme = new FormControl(false);
  @HostBinding('class') className = '';
  darkClass = 'theme-dark';
  lightClass = 'theme-light';

  constructor(private overlay: OverlayContainer, private dialog: MatDialogRef<SettingsComponent>) {
  }

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme') || this.lightClass;
    this.switchTheme.setValue(savedTheme === this.darkClass);

    this.switchTheme.valueChanges.subscribe((currentMode) => {
      const theme = currentMode ? this.darkClass : this.lightClass;
      localStorage.setItem('theme', theme);
      this.applyTheme(theme);
    });
  }

  applyTheme(theme: string) {
    document.body.classList.remove(this.darkClass, this.lightClass);
    document.body.classList.add(theme);
    this.overlay.getContainerElement().classList.remove(this.darkClass, this.lightClass);
    this.overlay.getContainerElement().classList.add(theme);
  }

  closeModal() {
    this.dialog.close();
    sessionStorage.removeItem('settingsOpen');
  }
}
