import { Injectable, signal } from '@angular/core';
import { MaterialRecord } from '../models/material-record';

const STORAGE_KEY = 'sc_materials';

@Injectable({ providedIn: 'root' })
export class MaterialStorageService {

  /** Reactive list — always in sync with localStorage. */
  readonly records = signal<MaterialRecord[]>(this.load());

  /** Last deleted records — used for undo. */
  readonly lastDeleted = signal<MaterialRecord[]>([]);

  getAll(): MaterialRecord[] {
    return this.records();
  }

  add(entry: Omit<MaterialRecord, 'id'>): MaterialRecord {
    const existing = this.records().find(
      r => r.material === entry.material &&
           r.quality  === entry.quality  &&
           r.location === entry.location
    );
    if (existing) {
      const merged = { ...existing, quantity: existing.quantity + entry.quantity };
      this.save(this.records().map(r => r.id === existing.id ? merged : r));
      return merged;
    }
    const record: MaterialRecord = { ...entry, id: crypto.randomUUID() };
    this.save([...this.records(), record]);
    return record;
  }

  remove(id: string): void {
    const record = this.records().find(r => r.id === id);
    if (record) this.lastDeleted.set([record]);
    this.save(this.records().filter(r => r.id !== id));
  }

  removeMany(ids: string[]): void {
    const idSet = new Set(ids);
    const deleted = this.records().filter(r => idSet.has(r.id));
    if (deleted.length) this.lastDeleted.set(deleted);
    this.save(this.records().filter(r => !idSet.has(r.id)));
  }

  undoDelete(): void {
    const toRestore = this.lastDeleted();
    if (!toRestore.length) return;
    this.save([...this.records(), ...toRestore]);
    this.lastDeleted.set([]);
  }

  updateQuantity(id: string, newQuantity: number): void {
    this.save(this.records().map(r => r.id === id ? { ...r, quantity: newQuantity } : r));
  }

  updateLocation(ids: string[], newLocation: string): void {
    this.save(this.records().map(r => ids.includes(r.id) ? { ...r, location: newLocation } : r));
  }

  replaceAll(incoming: Omit<MaterialRecord, 'id'>[]): void {
    const records = incoming.map(r => ({ ...r, id: crypto.randomUUID() }));
    this.save(records);
  }

  private load(): MaterialRecord[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try { return JSON.parse(raw) as MaterialRecord[]; } catch { return []; }
  }

  private save(records: MaterialRecord[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    this.records.set(records);
  }
}
