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

  activeTab: 'stations' | 'add' | 'list' = this.filter.activeStationCount() > 0 ? 'add' : 'stations';

  get activeStationCount(): number { return this.filter.activeStationCount(); }
  get recordCount(): number         { return this.storage.getAll().length; }

  onRecorded(): void {
    this.activeTab = 'list';
  }
}
