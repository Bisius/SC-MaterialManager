import { Component, inject, ElementRef, ViewChild, ChangeDetectorRef, HostListener, signal, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { materials, Material } from '../../../data/materials';
import { locations, Location } from '../../../data/locations';
import { MaterialStorageService } from '../../../services/material-storage.service';
import { StationFilterService } from '../../../services/station-filter.service';
import { CustomLocationService } from '../../../services/custom-location.service';
import { MaterialRecord } from '../../../models/material-record';

interface MaterialGroup {
  material: string;
  qualityMin: number;
  qualityMax: number;
  totalQty: number;
  records: MaterialRecord[];
}

@Component({
  selector: 'app-cargo-manifest',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './cargo-manifest.component.html',
})
export class CargoManifestComponent {

  @Output() openStations    = new EventEmitter<void>();
  @Output() openAddLocation = new EventEmitter<void>();
  @Output() openAddMaterial = new EventEmitter<void>();

  private readonly allMaterials: Material[] = materials;
  readonly allLocations: Location[] = locations;
  private storage      = inject(MaterialStorageService);
  private filter       = inject(StationFilterService);
  private customLocSvc = inject(CustomLocationService);
  private cdr          = inject(ChangeDetectorRef);

  get activeStationCount(): number { return this.filter.activeStationCount(); }

  get transferLocations(): Location[] {
    const active = this.filter.activeStations();
    if (active.size === 0) return this.allLocations;
    return this.allLocations.filter(l => active.has(l.name));
  }

  activeUseId: string | null = null;
  useAmount = 0;

  selectedIds = new Set<string>();
  transferDestination = '';
  expandedGroups = new Set<string>();
  collapsedLocations = new Set<string>();

  toggleLocation(loc: string): void {
    this.collapsedLocations.has(loc)
      ? this.collapsedLocations.delete(loc)
      : this.collapsedLocations.add(loc);
  }

  isLocationCollapsed(loc: string): boolean {
    return this.collapsedLocations.has(loc);
  }

  // ── Filters ────────────────────────────────────────────────
  qualityMin = 0;
  qualityMax = 1000;
  qtyMin = 0;

  readonly qualityShortcuts = [500, 700, 800, 900, 950];
  filtersCollapsed = true;
  selectedMaterials = new Set<string>();
  matDropPos: { top: number; left: number } | null = null;

  openMaterialDropdown(e: MouseEvent): void {
    e.stopPropagation();
    if (this.matDropPos) { this.matDropPos = null; return; }
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    this.matDropPos = { top: r.bottom + 4, left: r.left };
  }

  get availableMaterials(): string[] {
    return [...new Set(this.records.map(r => r.material))]
      .sort((a, b) => this.materialName(a).localeCompare(this.materialName(b)));
  }

  toggleMaterialFilter(mat: string): void {
    const next = new Set(this.selectedMaterials);
    next.has(mat) ? next.delete(mat) : next.add(mat);
    this.selectedMaterials = next;
  }

  isMaterialFiltered(mat: string): boolean {
    return this.selectedMaterials.has(mat);
  }

  setQualityMin(min: number): void {
    this.qualityMin = min;
    this.qualityMax = 1000;
  }

  get hasActiveFilter(): boolean {
    return this.qualityMin > 0 || this.qualityMax < 1000 ||
           this.qtyMin > 0 ||
           this.selectedMaterials.size > 0;
  }

  resetFilters(): void {
    this.qualityMin = 0; this.qualityMax = 1000;
    this.qtyMin = 0;
    this.selectedMaterials = new Set();
  }

  private passesFilter(r: MaterialRecord): boolean {
    return r.quality >= this.qualityMin && r.quality <= this.qualityMax &&
           r.quantity >= this.qtyMin &&
           (this.selectedMaterials.size === 0 || this.selectedMaterials.has(r.material));
  }

  get selectedCount(): number { return this.selectedIds.size; }

  get records(): MaterialRecord[] { return this.storage.records(); }

  get usedLocations(): string[] {
    return [...new Set(this.filteredRecords.map(r => r.location))].sort();
  }

  get filteredRecords(): MaterialRecord[] {
    return this.records.filter(r => this.passesFilter(r));
  }

  recordsAt(location: string): MaterialRecord[] {
    return this.filteredRecords.filter(r => r.location === location);
  }

  totalScu(location: string): number {
    return this.recordsAt(location).reduce((sum, r) => sum + r.quantity, 0);
  }

  materialGroupsAt(location: string): MaterialGroup[] {
    const byMat = new Map<string, MaterialRecord[]>();
    for (const r of this.recordsAt(location)) {
      const g = byMat.get(r.material) ?? [];
      g.push(r);
      byMat.set(r.material, g);
    }
    return [...byMat.entries()]
      .map(([mat, recs]) => ({
        material: mat,
        qualityMin: Math.min(...recs.map(r => r.quality)),
        qualityMax: Math.max(...recs.map(r => r.quality)),
        totalQty: recs.reduce((s, r) => s + r.quantity, 0),
        records: [...recs].sort((a, b) => b.quality - a.quality),
      }))
      .sort((a, b) => this.materialName(a.material).localeCompare(this.materialName(b.material)));
  }

  private groupKey(location: string, material: string): string {
    return `${location}|${material}`;
  }

  toggleGroup(location: string, material: string): void {
    const key = this.groupKey(location, material);
    this.expandedGroups.has(key) ? this.expandedGroups.delete(key) : this.expandedGroups.add(key);
    this.expandedGroups = new Set(this.expandedGroups);
  }

  isGroupExpanded(location: string, material: string): boolean {
    return this.expandedGroups.has(this.groupKey(location, material));
  }

  isGroupFullySelected(group: MaterialGroup): boolean {
    return group.records.length > 0 && group.records.every(r => this.selectedIds.has(r.id));
  }

  isGroupPartiallySelected(group: MaterialGroup): boolean {
    return group.records.some(r => this.selectedIds.has(r.id)) && !group.records.every(r => this.selectedIds.has(r.id));
  }

  toggleGroupSelection(group: MaterialGroup): void {
    const next = new Set(this.selectedIds);
    if (this.isGroupFullySelected(group)) {
      group.records.forEach(r => next.delete(r.id));
    } else {
      group.records.forEach(r => next.add(r.id));
    }
    this.selectedIds = next;
  }

  materialName(short: string): string {
    return this.allMaterials.find(m => m.short === short)?.name ?? short;
  }

  qualityFill(quality: number): string {
    return `${Math.min(Math.max(quality / 10, 0), 100)}%`;
  }

  qtyFill(quantity: number): string {
    return `${Math.min(Math.max(quantity, 0), 100)}%`;
  }

  onRemove(id: string): void {
    this.storage.remove(id);
    if (this.activeUseId === id) this.activeUseId = null;
  }

  onRemoveGroup(g: MaterialGroup): void {
    g.records.forEach(r => {
      this.storage.remove(r.id);
      this.selectedIds.delete(r.id);
      if (this.activeUseId === r.id) this.activeUseId = null;
    });
    this.selectedIds = new Set(this.selectedIds);
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
    this.activeUseId = null;
  }

  @ViewChild('importInput') importInput!: ElementRef<HTMLInputElement>;
  @ViewChild('matDropRef') matDropRef!: ElementRef<HTMLElement>;

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent): void {
    if (this.matDropPos && this.matDropRef && !this.matDropRef.nativeElement.contains(e.target as Node)) {
      this.matDropPos = null;
    }
  }

  onExport(): void {
    const exportData = this.records.map(({ id: _id, ...rest }) => rest);
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cargo-manifest-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  onImportClick(): void {
    this.importInput.nativeElement.value = '';
    this.importInput.nativeElement.click();
  }

  pendingImportData = signal<MaterialRecord[]>([]);
  showImportModal = false;

  onImportFile(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string) as MaterialRecord[];
        if (!Array.isArray(data)) return;
        const valid = data.filter(
          r => r.material && r.location && r.quantity != null && r.quality != null
        );
        if (valid.length === 0) return;
        this.pendingImportData.set(valid);
        this.showImportModal = true;
        this.cdr.detectChanges();
      } catch { /* invalid file, silently ignore */ }
    };
    reader.readAsText(file);
  }

  confirmImport(mode: 'replace' | 'merge'): void {
    const data = this.pendingImportData();

    // Register any location names not already known as custom locations
    const knownNames = new Set(this.filter.allLocations().map(l => l.name));
    const uniqueNewLocs = [...new Set(data.map(r => r.location))]
      .filter(name => !knownNames.has(name));
    uniqueNewLocs.forEach(name => this.customLocSvc.add(name, 'custom', false));

    if (mode === 'replace') {
      this.storage.replaceAll(data);
    } else {
      data.forEach(r => this.storage.add(
        { material: r.material, quality: r.quality, quantity: r.quantity, location: r.location }
      ));
    }
    this.showImportModal = false;
    this.pendingImportData.set([]);
    this.cdr.detectChanges();
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
    this.selectedIds = new Set();
    this.transferDestination = '';
  }
}
