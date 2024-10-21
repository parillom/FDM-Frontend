import {LOCALE_ID, NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {NavbarComponent} from './components/common/navbar/navbar.component';
import {DashboardComponent} from './components/device/dashboard/dashboard.component';
import {EditDeviceDialogComponent} from './components/device/dialog/edit-device-dialog/edit-device-dialog.component';
import {AddDeviceComponent} from './components/device/dialog/add-device/add-device.component';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatListModule} from '@angular/material/list';
import {MatInputModule} from '@angular/material/input';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {HttpClientModule, provideHttpClient, withInterceptors} from '@angular/common/http';
import {MatCard, MatCardActions, MatCardContent} from '@angular/material/card';
import {MatCheckbox} from '@angular/material/checkbox';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatTooltip} from '@angular/material/tooltip';
import {MatDialogActions, MatDialogContainer, MatDialogContent, MatDialogTitle} from '@angular/material/dialog';
import {MatOption, MatSelect} from '@angular/material/select';
import {BsModalService} from 'ngx-bootstrap/modal';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {ToastrModule} from 'ngx-toastr';
import {DeleteDialogComponent} from './components/common/dialog/delete-dialog/delete-dialog.component';
import {AddMultipleDevicesComponent} from './components/device/dialog/add-multiple-devices/add-multiple-devices.component';
import {errorInterceptor} from './services/interceptor/error.interceptor';
import {
  DeleteMultipleDialogComponent
} from './components/common/dialog/delete-multiple-dialog/delete-multiple-dialog.component';
import {ConfirmDialogComponent} from './components/common/dialog/confirm-dialog/confirm-dialog.component';
import {MatRadioButton, MatRadioGroup} from '@angular/material/radio';
import {MatAutocomplete, MatAutocompleteTrigger} from '@angular/material/autocomplete';
import {
  VehicleLocationAutocompletionDashboardComponent
} from './components/device/vehicle-location-autocompletion-dashboard/vehicle-location-autocompletion-dashboard.component';
import {MatSlideToggle} from '@angular/material/slide-toggle';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableModule
} from '@angular/material/table';
import {RouterModule} from '@angular/router';
import {MatSort, MatSortModule} from '@angular/material/sort';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {
  VehicleLocationAutocompletionComponent
} from './components/common/vehicle-location-autocompletion/vehicle-location-autocompletion.component';
import {MatPaginator} from '@angular/material/paginator';
import {VehicleDashboardComponent} from './components/vehicle/vehicle-dashboard/vehicle-dashboard.component';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {TooltipModule} from 'ngx-bootstrap/tooltip';
import {AddVehicleComponent} from './components/vehicle/dialog/add-vehicle/add-vehicle.component';
import {DeviceDetailsComponent} from './components/device/device-details/device-details.component';
import {VehicleEditComponent} from './components/vehicle/vehicle-edit/vehicle-edit.component';
import {
  AddDevicesToVehicleComponent
} from './components/vehicle/add-devices-to-vehicle/add-devices-to-vehicle.component';
import {MatGridList, MatGridTile} from '@angular/material/grid-list';
import {LocationDashboardComponent} from './components/location/location-dashboard/location-dashboard.component';
import {AddLocationComponent} from './components/location/dialog/add-location/add-location.component';
import {AddMultipleVehiclesComponent} from './components/vehicle/dialog/add-multiple-vehicles/add-multiple-vehicles.component';
import {SettingsComponent} from './components/common/settings/settings.component';
import { TestComponent } from './components/test/test.component';
import { DeviceStatePipe } from './services/pipe/device-state.pipe';
import { HighlightSearchTextPipe } from './services/pipe/highlight.search-text.pipe';
import {NgOptimizedImage, registerLocaleData} from '@angular/common';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader, MatExpansionPanelTitle
} from '@angular/material/expansion';
import {MatCalendar, MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import { EntityTypePipe } from './services/pipe/entity-type.pipe';
import {provideNativeDateAdapter} from '@angular/material/core';
import localeDe from '@angular/common/locales/de';
import {UpdateTypePipe} from './services/pipe/update-type.pipe';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import { DeviceWorkflowComponent } from './components/device/device-workflow/device-workflow.component';
import { LocationEditComponent } from './components/location/location-edit/location-edit.component';
import { AddDevicesToLocationComponent } from './components/location/add-devices-to-location/add-devices-to-location.component';
import { DeviceTypeAutocompletionComponent } from './components/device/device-type-autocompletion/device-type-autocompletion.component';
import { DeviceNoticeAutocompletionComponent } from './components/device/device-notice-autocompletion/device-notice-autocompletion.component';
import {MatFormFieldModule} from '@angular/material/form-field';

registerLocaleData(localeDe);

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    DashboardComponent,
    EditDeviceDialogComponent,
    AddDeviceComponent,
    DeleteDialogComponent,
    AddMultipleDevicesComponent,
    DeleteMultipleDialogComponent,
    ConfirmDialogComponent,
    VehicleLocationAutocompletionDashboardComponent,
    VehicleLocationAutocompletionComponent,
    VehicleDashboardComponent,
    AddVehicleComponent,
    DeviceDetailsComponent,
    VehicleEditComponent,
    AddDevicesToVehicleComponent,
    LocationDashboardComponent,
    AddLocationComponent,
    AddMultipleVehiclesComponent,
    SettingsComponent,
    TestComponent,
    DeviceStatePipe,
    HighlightSearchTextPipe,
    UpdateTypePipe,
    EntityTypePipe,
    UpdateTypePipe,
    DeviceWorkflowComponent,
    LocationEditComponent,
    AddDevicesToLocationComponent,
    DeviceTypeAutocompletionComponent,
    DeviceNoticeAutocompletionComponent,
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
    MatSortModule,
    MatTableModule,
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
      timeOut: 7000,
      positionClass: 'toast-top-right',
      titleClass: '',
      preventDuplicates: true,
      progressBar: true,
      enableHtml: true,
    }),
    MatRadioGroup,
    MatRadioButton,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatSlideToggle,
    MatHeaderCell,
    MatColumnDef,
    MatCell,
    MatHeaderCellDef,
    MatCellDef,
    MatTable,
    MatHeaderRow,
    MatRow,
    MatHeaderRowDef,
    MatRowDef,
    RouterModule,
    MatSort,
    MatTabGroup,
    MatTab,
    MatPaginator,
    MatProgressSpinner,
    TooltipModule,
    MatCardContent,
    MatCardActions,
    MatGridList,
    MatGridTile,
    MatDialogContainer,
    NgOptimizedImage,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelDescription,
    MatExpansionPanelTitle,
    MatCalendar,
    MatDatepicker,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    MatFormFieldModule
  ],
  providers: [
    BsModalService,
    NavbarComponent,
    DashboardComponent,
    VehicleDashboardComponent,
    LocationDashboardComponent,
    { provide: LOCALE_ID, useValue: 'de-DE' },
    provideNativeDateAdapter(),
    provideAnimationsAsync(),
    provideHttpClient(
      withInterceptors([errorInterceptor])
    ),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
