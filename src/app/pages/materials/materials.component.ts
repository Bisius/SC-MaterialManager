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

  private readonly TAB_KEY = 'sc_active_tab';
  private readonly VALID_TABS = ['stations', 'add', 'list'] as const;

  private savedTab = localStorage.getItem(this.TAB_KEY) as typeof this.activeTab | null;

  activeTab: 'stations' | 'add' | 'list' = this.VALID_TABS.includes(this.savedTab as any)
    ? this.savedTab!
    : this.filter.activeStationCount() > 0 ? 'add' : 'stations';

  setTab(tab: 'stations' | 'add' | 'list'): void {
    this.activeTab = tab;
    localStorage.setItem(this.TAB_KEY, tab);
  }

  get activeStationCount(): number { return this.filter.activeStationCount(); }
  get recordCount(): number         { return this.storage.getAll().length; }

  onRecorded(goToManifest: boolean): void {
    if (goToManifest) this.setTab('list');
  }
}
