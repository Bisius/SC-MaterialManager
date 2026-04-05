import { Injectable, signal, computed } from '@angular/core';
import { locations, Location } from '../data/locations';

const STATIONS_KEY = 'sc_active_stations';

@Injectable({ providedIn: 'root' })
export class StationFilterService {

  readonly allLocations: Location[] = locations;
  readonly systems: string[] = [...new Set(locations.map(l => l.system))];

  private _active = signal<Set<string>>(this.load());

  /** Read-only signal of the active set */
  readonly activeStations = this._active.asReadonly();

  /** Number of active stations */
  readonly activeStationCount = computed(() => this._active().size);

  /** Systems that have at least one active location (or all if none selected) */
  readonly filteredSystems = computed(() => {
    if (this._active().size === 0) return this.systems;
    return this.systems.filter(s => this.filteredLocationsBySystem(s).length > 0);
  });

  locationsBySystem(system: string): Location[] {
    return this.allLocations.filter(l => l.system === system);
  }

  filteredLocationsBySystem(system: string): Location[] {
    const all = this.locationsBySystem(system);
    if (this._active().size === 0) return all;
    return all.filter(l => this._active().has(l.name));
  }

  isStationActive(name: string): boolean {
    return this._active().has(name);
  }

  isSystemFullyActive(system: string): boolean {
    return this.locationsBySystem(system).every(l => this._active().has(l.name));
  }

  isSystemPartiallyActive(system: string): boolean {
    const locs = this.locationsBySystem(system);
    return locs.some(l => this._active().has(l.name)) && !locs.every(l => this._active().has(l.name));
  }

  toggleStation(name: string): void {
    const next = new Set(this._active());
    next.has(name) ? next.delete(name) : next.add(name);
    this._active.set(next);
    this.save();
  }

  toggleSystem(system: string): void {
    const next = new Set(this._active());
    const locs = this.locationsBySystem(system);
    const allActive = locs.every(l => next.has(l.name));
    locs.forEach(l => allActive ? next.delete(l.name) : next.add(l.name));
    this._active.set(next);
    this.save();
  }

  private load(): Set<string> {
    try {
      const raw = localStorage.getItem(STATIONS_KEY);
      return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
    } catch {
      return new Set();
    }
  }

  private save(): void {
    localStorage.setItem(STATIONS_KEY, JSON.stringify([...this._active()]));
  }
}
