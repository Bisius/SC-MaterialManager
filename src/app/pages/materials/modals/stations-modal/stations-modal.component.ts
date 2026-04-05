import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { StationFilterService } from '../../../../services/station-filter.service';

@Component({
  selector: 'app-stations-modal',
  standalone: true,
  imports: [],
  templateUrl: './stations-modal.component.html',
})
export class StationsModalComponent {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();

  readonly filter = inject(StationFilterService);
  readonly refineryOnly = signal(false);
}
