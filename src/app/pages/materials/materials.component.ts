import { Component } from '@angular/core';
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

  showStationsModal = false;
  showAddModal = false;
  showAddLocationModal = false;
  showChangelogModal = false;

  readonly changelog: { version: string; date: string; changes: string[] }[] = [
    {
      version: 'v1.2',
      date: '2026-04-08',
      changes: [
        'Location autocomplete: focus shows active stations, typing ranks active matches first',
      ],
    },
    {
      version: 'v1.1',
      date: '2026-04-06',
      changes: [
        'Responsive layout for mobile devices',
      ],
    },
    {
      version: 'v1.0',
      date: '2026-04-05',
      changes: [
        'Initial release',
      ],
    },
  ];

  onRecorded(goToManifest: boolean): void {
    if (goToManifest) this.showAddModal = false;
  }
}
