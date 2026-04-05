import { Component, inject } from '@angular/core';
import { StationFilterService } from '../../services/station-filter.service';
import { MaterialStorageService } from '../../services/material-storage.service';
import { StationsComponent } from './tabs/stations/stations.component';
import { AddMaterialComponent } from './tabs/add-material/add-material.component';
import { CargoManifestComponent } from './tabs/cargo-manifest/cargo-manifest.component';

@Component({
  selector: 'app-materials',
  standalone: true,
  imports: [StationsComponent, AddMaterialComponent, CargoManifestComponent],
  templateUrl: './materials.component.html',
})
export class MaterialsComponent {

  private filter  = inject(StationFilterService);
  private storage = inject(MaterialStorageService);

  showStationsModal = false;
  showAddModal = false;

  get activeStationCount(): number { return this.filter.activeStationCount(); }
  get recordCount(): number         { return this.storage.getAll().length; }

  onRecorded(goToManifest: boolean): void {
    if (goToManifest) this.showAddModal = false;
  }
}
