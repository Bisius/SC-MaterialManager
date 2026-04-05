import { Component, inject, signal } from '@angular/core';
import { StationFilterService } from '../../../../services/station-filter.service';

@Component({
  selector: 'app-stations',
  standalone: true,
  templateUrl: './stations.component.html',
})
export class StationsComponent {
  readonly filter = inject(StationFilterService);
  readonly refineryOnly = signal(false);
}
