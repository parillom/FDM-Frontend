import {Component, HostBinding, OnInit} from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'fdm-frontend';
  @HostBinding('class') className = '';

  darkClass = 'theme-dark';
  lightClass = 'theme-light';

  ngOnInit() {
    const savedTheme = localStorage.getItem('theme') || this.lightClass;
    this.applyTheme(savedTheme);
  }

  applyTheme(theme: string) {
    document.body.classList.remove(this.darkClass, this.lightClass);
    document.body.classList.add(theme);
  }

}
