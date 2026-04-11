import { Component } from '@angular/core';
import { CargoManifestComponent } from './cargo-manifest/cargo-manifest.component';
import { ChangelogModalComponent } from './modals/changelog-modal/changelog-modal.component';
import { StationsModalComponent } from './modals/stations-modal/stations-modal.component';
import { AddLocationModalComponent } from './modals/add-location-modal/add-location-modal.component';
import { AddMaterialModalComponent } from './modals/add-material-modal/add-material-modal.component';
import { HelpModalComponent } from './modals/help-modal/help-modal.component';

@Component({
  selector: 'app-materials',
  standalone: true,
  imports: [CargoManifestComponent, ChangelogModalComponent, StationsModalComponent, AddLocationModalComponent, AddMaterialModalComponent, HelpModalComponent],
  templateUrl: './materials.component.html',
})
export class MaterialsComponent {

  showStationsModal = false;
  showAddModal = false;
  showAddLocationModal = false;
  showChangelogModal = false;
  showHelpModal = false;

  readonly changelog: { version: string; date: string; changes: string[] }[] = [
    {
      version: 'v1.2.1',
      date: '2026-04-11',
      changes: [
        'Added Gaslight station (Pyro)',
        'Added Bexalite to the materials list',
      ],
    },
    {
      version: 'v1.2',
      date: '2026-04-09',
      changes: [
        'Added location search when adding material records',
        'Added another reset filters button',
        'Quantity filter changed to minimum-value slider',
        'Undo button to restore last deleted record(s)',
        'Added "How to use" help guide in the footer',
        'Duplicate material records at the same location and quality are now merged automatically',
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
