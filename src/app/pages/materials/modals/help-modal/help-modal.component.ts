import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-help-modal',
  standalone: true,
  imports: [],
  templateUrl: './help-modal.component.html',
})
export class HelpModalComponent {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();
}
