import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CustomLocationService } from '../../../../services/custom-location.service';
import { StationFilterService } from '../../../../services/station-filter.service';

@Component({
  selector: 'app-add-location',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-location.component.html',
})
export class AddLocationComponent {
  private customSvc = inject(CustomLocationService);
  private filterSvc = inject(StationFilterService);

  readonly customLocations = this.customSvc.customLocations;

  name     = '';
  refinery = false;

  readonly nameError = signal('');

  private allNames = computed(() =>
    this.filterSvc.allLocations().map(l => l.name.toLowerCase())
  );

  submit(): void {
    const name = this.name.trim();

    if (!name) { this.nameError.set('Name is required.'); return; }
    if (this.allNames().includes(name.toLowerCase())) {
      this.nameError.set('A location with this name already exists.');
      return;
    }

    this.customSvc.add(name, 'custom', this.refinery);
    this.name = '';
    this.refinery = false;
    this.nameError.set('');
  }

  remove(name: string): void {
    this.customSvc.remove(name);
  }
}
