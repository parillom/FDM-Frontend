import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Vehicle} from '../../../models/Vehicle';
import {Location} from '../../../models/Location';

@Component({
  selector: 'app-vehicle-autocompletion',
  templateUrl: './vehicle-location-autocompletion.component.html',
  styleUrl: './vehicle-location-autocompletion.component.scss'
})
export class VehicleLocationAutocompletionComponent implements OnInit{

  @Output() setVehicleInput: EventEmitter<Vehicle> = new EventEmitter<Vehicle>();

  @Output() setLocationInput: EventEmitter<Location> = new EventEmitter<Location>();

  @Input() locations?: Location[];

  @Input() vehicles?: Vehicle[];

  @Input() showVehicleInput?: boolean;

  @Input() showLocationInput?: boolean;

  filteredVehicles?: Vehicle[];
  filteredLocations?: Location[];

  ngOnInit() {
    if (this.vehicles) {
      this.filteredVehicles = this.vehicles;
    }
    if (this.locations) {
      this.filteredLocations = this.locations;
    }
  }

  filter(event: any, isVehicle: boolean) {
    if (isVehicle) {
      this.filteredVehicles = this.vehicles?.filter(v => v.name!.toLowerCase().includes(event.target.value.toLowerCase()));
    } else {
      this.filteredLocations = this.locations?.filter(l => l.name!.toLowerCase().includes(event.target.value.toLowerCase()));
    }
  }

}
