import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, inject, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { materials, Material } from '../../../../data/materials';
import { Location } from '../../../../data/locations';
import { MaterialStorageService } from '../../../../services/material-storage.service';
import { StationFilterService } from '../../../../services/station-filter.service';

@Component({
  selector: 'app-add-material-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-material-modal.component.html',
})
export class AddMaterialModalComponent {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();
  @Output() recorded = new EventEmitter<boolean>();

  readonly materials: Material[] = materials;

  private fb      = inject(FormBuilder);
  private storage = inject(MaterialStorageService);
  readonly filter = inject(StationFilterService);

  readonly goToManifest = signal(false);

  @ViewChild('locationWrapper') private locationWrapperEl!: ElementRef<HTMLElement>;

  readonly locationInputText    = signal('');
  readonly locationDropdownOpen = signal(false);
  readonly locDropPos = signal<{ top: number; left: number; width: number } | null>(null);

  private updateLocDropPos(): void {
    const el = this.locationWrapperEl?.nativeElement;
    if (!el) return;
    const r = el.getBoundingClientRect();
    this.locDropPos.set({ top: r.bottom + 2, left: r.left, width: r.width });
  }

  onLocationFocus(): void {
    this.updateLocDropPos();
    this.locationDropdownOpen.set(true);
  }

  /** Items to show in the dropdown.
   *  Empty query → active stations (all if none pinned).
   *  Query present → all matching locations, active-pinned ones first. */
  readonly locationDropdownItems = computed<{ loc: Location; isActive: boolean }[]>(() => {
    const q      = this.locationInputText().toLowerCase().trim();
    const active = this.filter.activeStations();

    if (!q) {
      const list = active.size === 0
        ? this.filter.allLocations()
        : this.filter.allLocations().filter(l => active.has(l.name));
      return list.map(l => ({ loc: l, isActive: active.has(l.name) }));
    }

    const matches       = this.filter.allLocations().filter(l => l.name.toLowerCase().includes(q));
    const activeMatches = matches.filter(l => active.has(l.name));
    const restMatches   = matches.filter(l => !active.has(l.name));
    return [
      ...activeMatches.map(l => ({ loc: l, isActive: true  })),
      ...restMatches  .map(l => ({ loc: l, isActive: false })),
    ];
  });

  onLocationInput(val: string): void {
    this.locationInputText.set(val);
    this.locationCtrl.setValue('');
    this.updateLocDropPos();
    this.locationDropdownOpen.set(true);
  }

  selectLocation(name: string): void {
    this.locationCtrl.setValue(name);
    this.locationInputText.set(name);
    this.locationDropdownOpen.set(false);
  }

  materialCtrl = new FormControl<string>('', { nonNullable: true, validators: [Validators.required] });
  qualityCtrl  = new FormControl<number | null>(null, [Validators.required, Validators.min(0), Validators.max(1000)]);
  quantityCtrl = new FormControl<number | null>(null, [Validators.required, Validators.min(0)]);
  locationCtrl = new FormControl<string>('', { nonNullable: true, validators: [Validators.required] });

  form: FormGroup = this.fb.group({
    material: this.materialCtrl,
    quality:  this.qualityCtrl,
    quantity: this.quantityCtrl,
    location: this.locationCtrl,
  });

  onAdd(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const keepMaterial = this.materialCtrl.value;
    const keepLocation = this.locationCtrl.value;
    this.storage.add({
      material: keepMaterial,
      quality:  this.qualityCtrl.value!,
      quantity: this.quantityCtrl.value!,
      location: keepLocation,
    });
    this.form.reset();
    this.materialCtrl.setValue(keepMaterial);
    this.locationCtrl.setValue(keepLocation);
    this.locationInputText.set(keepLocation);
    this.recorded.emit(this.goToManifest());
  }
}
