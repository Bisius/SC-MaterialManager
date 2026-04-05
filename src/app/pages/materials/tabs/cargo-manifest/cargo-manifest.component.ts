import { Component, OnInit, inject } from '@angular/core';
import { materials, Material } from '../../../../data/materials';
import { MaterialStorageService } from '../../../../services/material-storage.service';
import { MaterialRecord } from '../../../../models/material-record';

@Component({
  selector: 'app-cargo-manifest',
  standalone: true,
  templateUrl: './cargo-manifest.component.html',
})
export class CargoManifestComponent implements OnInit {

  private readonly allMaterials: Material[] = materials;
  private storage = inject(MaterialStorageService);

  records: MaterialRecord[] = [];

  ngOnInit(): void {
    this.records = this.storage.getAll();
  }

  get usedLocations(): string[] {
    return [...new Set(this.records.map(r => r.location))].sort();
  }

  recordsAt(location: string): MaterialRecord[] {
    return this.records.filter(r => r.location === location);
  }

  totalScu(location: string): number {
    return this.recordsAt(location).reduce((sum, r) => sum + r.quantity, 0);
  }

  materialName(short: string): string {
    return this.allMaterials.find(m => m.short === short)?.name ?? short;
  }

  onRemove(id: string): void {
    this.storage.remove(id);
    this.records = this.storage.getAll();
  }
}
