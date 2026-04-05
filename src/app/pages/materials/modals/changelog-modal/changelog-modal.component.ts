import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-changelog-modal',
  standalone: true,
  imports: [],
  templateUrl: './changelog-modal.component.html',
})
export class ChangelogModalComponent {
  @Input() open = false;
  @Input() changelog: { version: string; date: string; changes: string[] }[] = [];
  @Output() close = new EventEmitter<void>();
}
