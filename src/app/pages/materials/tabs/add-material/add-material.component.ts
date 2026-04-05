import { Component, inject, output, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { materials, Material } from '../../../../data/materials';
import { MaterialStorageService } from '../../../../services/material-storage.service';
import { StationFilterService } from '../../../../services/station-filter.service';

@Component({
  selector: 'app-add-material',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-material.component.html',
})
export class AddMaterialComponent {

  readonly materials: Material[] = materials;

  private fb      = inject(FormBuilder);
  private storage = inject(MaterialStorageService);
  readonly filter = inject(StationFilterService);

  /** Emitted after a record is successfully added; value indicates whether to navigate to manifest */
  readonly recorded = output<boolean>();

  readonly goToManifest = signal(true);

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
    this.storage.add({
      material: this.materialCtrl.value,
      quality:  this.qualityCtrl.value!,
      quantity: this.quantityCtrl.value!,
      location: this.locationCtrl.value,
    });
    this.form.reset();
    this.recorded.emit(this.goToManifest());
  }
}
