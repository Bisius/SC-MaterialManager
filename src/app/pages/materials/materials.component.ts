import { Component, OnInit, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { materials, Material } from '../../data/materials';
import { locations, Location } from '../../data/locations';
import { MaterialStorageService } from '../../services/material-storage.service';
import { MaterialRecord } from '../../models/material-record';

@Component({
  selector: 'app-materials',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './materials.component.html',
})
export class MaterialsComponent implements OnInit {

  readonly materials: Material[] = materials;
  readonly locations: Location[] = locations;
  readonly systems: string[] = [...new Set(locations.map(l => l.system))];

  private fb = inject(FormBuilder);
  private storage = inject(MaterialStorageService);

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

  records: MaterialRecord[] = [];

  ngOnInit(): void {
    this.records = this.storage.getAll();
  }

  locationsBySystem(system: string): Location[] {
    return this.locations.filter(l => l.system === system);
  }

  materialName(short: string): string {
    return this.materials.find(m => m.short === short)?.name ?? short;
  }

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
    this.records = this.storage.getAll();
    this.form.reset();
  }

  onRemove(id: string): void {
    this.storage.remove(id);
    this.records = this.storage.getAll();
  }
}
