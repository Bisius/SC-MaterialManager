import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { materials, Material } from '../../../../data/materials';
import { locations, Location } from '../../../../data/locations';
import { MaterialStorageService } from '../../../../services/material-storage.service';
import { StationFilterService } from '../../../../services/station-filter.service';
import { MaterialRecord } from '../../../../models/material-record';

@Component({
  selector: 'app-cargo-manifest',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './cargo-manifest.component.html',
})
export class CargoManifestComponent implements OnInit {

  private readonly allMaterials: Material[] = materials;
  readonly allLocations: Location[] = locations;
  private storage = inject(MaterialStorageService);
  private filter = inject(StationFilterService);

  get transferLocations(): Location[] {
    const active = this.filter.activeStations();
    if (active.size === 0) return this.allLocations;
    return this.allLocations.filter(l => active.has(l.name));
  }

  records: MaterialRecord[] = [];
  activeUseId: string | null = null;
  useAmount = 0;

  selectedIds = new Set<string>();
  transferDestination = '';

  get selectedCount(): number { return this.selectedIds.size; }

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
    if (this.activeUseId === id) this.activeUseId = null;
  }

  onOpenUse(r: MaterialRecord): void {
    if (this.activeUseId === r.id) {
      this.activeUseId = null;
      return;
    }
    this.activeUseId = r.id;
    this.useAmount = 0;
  }

  onCancelUse(): void {
    this.activeUseId = null;
  }

  onConfirmUse(r: MaterialRecord): void {
    const remaining = r.quantity - this.useAmount;
    if (remaining <= 0) {
      this.storage.remove(r.id);
      this.selectedIds.delete(r.id);
    } else {
      this.storage.updateQuantity(r.id, remaining);
    }
    this.records = this.storage.getAll();
    this.activeUseId = null;
  }

  toggleSelect(id: string): void {
    this.selectedIds.has(id) ? this.selectedIds.delete(id) : this.selectedIds.add(id);
    this.selectedIds = new Set(this.selectedIds);
  }

  isSelected(id: string): boolean {
    return this.selectedIds.has(id);
  }

  isLocationFullySelected(location: string): boolean {
    const ids = this.recordsAt(location).map(r => r.id);
    return ids.length > 0 && ids.every(id => this.selectedIds.has(id));
  }

  isLocationPartiallySelected(location: string): boolean {
    const ids = this.recordsAt(location).map(r => r.id);
    return ids.some(id => this.selectedIds.has(id)) && !ids.every(id => this.selectedIds.has(id));
  }

  toggleLocationSelection(location: string): void {
    const ids = this.recordsAt(location).map(r => r.id);
    const next = new Set(this.selectedIds);
    if (this.isLocationFullySelected(location)) {
      ids.forEach(id => next.delete(id));
    } else {
      ids.forEach(id => next.add(id));
    }
    this.selectedIds = next;
  }

  selectAll(): void {
    this.selectedIds = new Set(this.records.map(r => r.id));
  }

  clearSelection(): void {
    this.selectedIds = new Set();
  }

  onTransfer(): void {
    if (!this.transferDestination || this.selectedIds.size === 0) return;
    this.storage.updateLocation([...this.selectedIds], this.transferDestination);
    this.records = this.storage.getAll();
    this.selectedIds = new Set();
    this.transferDestination = '';
  }
}
