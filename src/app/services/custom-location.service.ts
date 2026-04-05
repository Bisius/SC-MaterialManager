import { Injectable, signal } from '@angular/core';
import { Location, LocationType } from '../data/locations';

const STORAGE_KEY = 'sc_custom_locations';

@Injectable({ providedIn: 'root' })
export class CustomLocationService {

  readonly customLocations = signal<Location[]>(this.load());

  add(name: string, system: string, refinery: boolean): void {
    const next: Location[] = [
      ...this.customLocations(),
      { name, system, type: LocationType.Station, refinery },
    ];
    this.save(next);
  }

  remove(name: string): void {
    this.save(this.customLocations().filter(l => l.name !== name));
  }

  private load(): Location[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Location[]) : [];
    } catch {
      return [];
    }
  }

  private save(locations: Location[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
    this.customLocations.set(locations);
  }
}
