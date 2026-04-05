import { Injectable } from '@angular/core';
import { MaterialRecord } from '../models/material-record';

const STORAGE_KEY = 'sc_materials';

@Injectable({ providedIn: 'root' })
export class MaterialStorageService {

  getAll(): MaterialRecord[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as MaterialRecord[];
    } catch {
      return [];
    }
  }

  add(entry: Omit<MaterialRecord, 'id'>): MaterialRecord {
    const records = this.getAll();
    const record: MaterialRecord = { ...entry, id: crypto.randomUUID() };
    records.push(record);
    this.save(records);
    return record;
  }

  remove(id: string): void {
    const records = this.getAll().filter(r => r.id !== id);
    this.save(records);
  }

  updateQuantity(id: string, newQuantity: number): void {
    const records = this.getAll().map(r => r.id === id ? { ...r, quantity: newQuantity } : r);
    this.save(records);
  }

  private save(records: MaterialRecord[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }
}
