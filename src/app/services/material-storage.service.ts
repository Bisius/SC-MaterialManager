import { Injectable, signal } from '@angular/core';
import { MaterialRecord } from '../models/material-record';

const STORAGE_KEY = 'sc_materials';

@Injectable({ providedIn: 'root' })
export class MaterialStorageService {

  /** Reactive list — always in sync with localStorage. */
  readonly records = signal<MaterialRecord[]>(this.load());

  getAll(): MaterialRecord[] {
    return this.records();
  }

  add(entry: Omit<MaterialRecord, 'id'>): MaterialRecord {
    const record: MaterialRecord = { ...entry, id: crypto.randomUUID() };
    const next = [...this.records(), record];
    this.save(next);
    return record;
  }

  remove(id: string): void {
    this.save(this.records().filter(r => r.id !== id));
  }

  updateQuantity(id: string, newQuantity: number): void {
    this.save(this.records().map(r => r.id === id ? { ...r, quantity: newQuantity } : r));
  }

  updateLocation(ids: string[], newLocation: string): void {
    this.save(this.records().map(r => ids.includes(r.id) ? { ...r, location: newLocation } : r));
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
