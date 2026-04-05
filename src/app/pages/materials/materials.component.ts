import { Component, inject } from '@angular/core';
import { MaterialStorageService } from '../../services/material-storage.service';
import { CargoManifestComponent } from './cargo-manifest/cargo-manifest.component';
import { ChangelogModalComponent } from './modals/changelog-modal/changelog-modal.component';
import { StationsModalComponent } from './modals/stations-modal/stations-modal.component';
import { AddLocationModalComponent } from './modals/add-location-modal/add-location-modal.component';
import { AddMaterialModalComponent } from './modals/add-material-modal/add-material-modal.component';

@Component({
  selector: 'app-materials',
  standalone: true,
  imports: [CargoManifestComponent, ChangelogModalComponent, StationsModalComponent, AddLocationModalComponent, AddMaterialModalComponent],
  templateUrl: './materials.component.html',
})
export class MaterialsComponent {

  private storage = inject(MaterialStorageService);

  showStationsModal = false;
  showAddModal = false;
  showAddLocationModal = false;
  showChangelogModal = false;

  readonly changelog: { version: string; date: string; changes: string[] }[] = [
    {
      version: 'v1.0',
      date: '2026-04-05',
      changes: [
        'Initial release',
      ],
    },
  ];

  get recordCount(): number { return this.storage.getAll().length; }

  onRecorded(goToManifest: boolean): void {
    if (goToManifest) this.showAddModal = false;
  }
}
