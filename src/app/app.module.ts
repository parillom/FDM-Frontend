import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {NavbarComponent} from './components/navbar/navbar.component';
import {DashboardComponent} from './components/dashboard/dashboard.component';
import {EditDialogComponent} from './components/edit-dialog/edit-dialog.component';
import {AddDeviceComponent} from './components/add-device/add-device.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatListModule} from '@angular/material/list';
import {MatInputModule} from '@angular/material/input';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule, provideHttpClient} from '@angular/common/http';
import {MatCard} from '@angular/material/card';
import {MatCheckbox} from '@angular/material/checkbox';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatTooltip} from '@angular/material/tooltip';
import {MatDialogActions, MatDialogContent, MatDialogTitle} from '@angular/material/dialog';
import {MatOption, MatSelect} from '@angular/material/select';
import {BsModalService} from 'ngx-bootstrap/modal';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {ToastrModule} from 'ngx-toastr';
import {DeleteDialogComponent} from './components/delete-dialog/delete-dialog.component';
import {AddMultipleDevicesComponent} from './components/add-multiple-devices/add-multiple-devices.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    DashboardComponent,
    EditDialogComponent,
    AddDeviceComponent,
    DeleteDialogComponent,
    AddMultipleDevicesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MatToolbarModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatInputModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatCard,
    MatCheckbox,
    FormsModule,
    MatTooltip,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    ReactiveFormsModule,
    MatSelect,
    MatOption,
    NgbModule,
    DragDropModule,
    ToastrModule.forRoot({
      timeOut: 5000,
      positionClass: 'toast-top-right',
      preventDuplicates: true,
      progressBar: true
    }),
  ],
  providers: [
    BsModalService,
    provideAnimationsAsync(),
    provideHttpClient()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
