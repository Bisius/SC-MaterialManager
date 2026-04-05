import { TestBed } from '@angular/core/testing';
import { StationFilterService } from './station-filter.service';
import { CustomLocationService } from './custom-location.service';

describe('StationFilterService', () => {
  let service: StationFilterService;
  let customSvc: CustomLocationService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(StationFilterService);
    customSvc = TestBed.inject(CustomLocationService);
  });

  // ─── allLocations / systems ───────────────────────────────────────────────

  it('should expose built-in locations in allLocations', () => {
    expect(service.allLocations().length).toBeGreaterThan(0);
  });

  it('allLocations should include a custom location after it is added', () => {
    const before = service.allLocations().length;
    customSvc.add('My Station', 'Stanton', false);
    expect(service.allLocations().length).toBe(before + 1);
    expect(service.allLocations().some(l => l.name === 'My Station')).toBe(true);
  });

  it('systems should contain Stanton, Pyro and Nyx from built-in data', () => {
    const sys = service.systems();
    expect(sys).toContain('Stanton');
    expect(sys).toContain('Pyro');
    expect(sys).toContain('Nyx');
  });

  // ─── initial state ────────────────────────────────────────────────────────

  it('should start with no active stations', () => {
    expect(service.activeStationCount()).toBe(0);
  });

  it('filteredLocationsBySystem should return all locations when nothing is active', () => {
    const all = service.locationsBySystem('Stanton');
    const filtered = service.filteredLocationsBySystem('Stanton');
    expect(filtered).toEqual(all);
  });

  it('filteredSystems should return all systems when nothing is active', () => {
    expect(service.filteredSystems()).toEqual(service.systems());
  });

  // ─── toggleStation ────────────────────────────────────────────────────────

  it('toggleStation() should activate a station', () => {
    service.toggleStation('Port Tressler');
    expect(service.isStationActive('Port Tressler')).toBe(true);
    expect(service.activeStationCount()).toBe(1);
  });

  it('toggleStation() should deactivate an already-active station', () => {
    service.toggleStation('Port Tressler');
    service.toggleStation('Port Tressler');
    expect(service.isStationActive('Port Tressler')).toBe(false);
    expect(service.activeStationCount()).toBe(0);
  });

  it('toggleStation() should persist to localStorage', () => {
    service.toggleStation('Port Tressler');
    const stored = JSON.parse(localStorage.getItem('sc_active_stations')!);
    expect(stored).toContain('Port Tressler');
  });

  it('should load persisted active stations on construction', () => {
    service.toggleStation('Port Tressler');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const fresh = TestBed.inject(StationFilterService);
    expect(fresh.isStationActive('Port Tressler')).toBe(true);
    expect(fresh.activeStationCount()).toBe(1);
  });

  // ─── filteredLocationsBySystem with active stations ───────────────────────

  it('filteredLocationsBySystem should only return active built-in locations when active set is non-empty', () => {
    service.toggleStation('Port Tressler');
    const filtered = service.filteredLocationsBySystem('Stanton');
    expect(filtered.some(l => l.name === 'Port Tressler')).toBe(true);
    // Inactive built-in stations should not appear
    expect(filtered.some(l => l.name === 'Orison')).toBe(false);
  });

  it('filteredLocationsBySystem should always include custom locations regardless of active set', () => {
    customSvc.add('My Outpost', 'Stanton', false);
    service.toggleStation('Port Tressler'); // activate one station so the filter is engaged
    const filtered = service.filteredLocationsBySystem('Stanton');
    expect(filtered.some(l => l.name === 'My Outpost')).toBe(true);
  });

  it('filteredSystems should exclude systems with no active locations when some are active', () => {
    // Activate only a Stanton station
    service.toggleStation('Port Tressler');
    const filtered = service.filteredSystems();
    expect(filtered).toContain('Stanton');
    // Other systems have no active stations so should be excluded
    expect(filtered).not.toContain('Nyx');
  });

  // ─── toggleSystem ─────────────────────────────────────────────────────────

  it('toggleSystem() should activate all stations in the system when none are active', () => {
    service.toggleSystem('Pyro');
    const pyroLocs = service.locationsBySystem('Pyro');
    expect(pyroLocs.every(l => service.isStationActive(l.name))).toBe(true);
  });

  it('toggleSystem() should deactivate all stations in the system when all are active', () => {
    service.toggleSystem('Pyro');
    service.toggleSystem('Pyro');
    const pyroLocs = service.locationsBySystem('Pyro');
    expect(pyroLocs.some(l => service.isStationActive(l.name))).toBe(false);
  });

  it('toggleSystem() with partial selection should activate the remaining stations', () => {
    const pyroLocs = service.locationsBySystem('Pyro');
    // Activate only one station manually
    service.toggleStation(pyroLocs[0].name);
    // toggleSystem on partial → should activate all
    service.toggleSystem('Pyro');
    expect(pyroLocs.every(l => service.isStationActive(l.name))).toBe(true);
  });

  // ─── isSystemFullyActive / isSystemPartiallyActive ───────────────────────

  it('isSystemFullyActive should return false when no stations are active', () => {
    expect(service.isSystemFullyActive('Pyro')).toBe(false);
  });

  it('isSystemFullyActive should return true when all system stations are active', () => {
    service.toggleSystem('Pyro');
    expect(service.isSystemFullyActive('Pyro')).toBe(true);
  });

  it('isSystemPartiallyActive should return false when none are active', () => {
    expect(service.isSystemPartiallyActive('Pyro')).toBe(false);
  });

  it('isSystemPartiallyActive should return true when some (not all) are active', () => {
    const pyroLocs = service.locationsBySystem('Pyro');
    service.toggleStation(pyroLocs[0].name);
    expect(service.isSystemPartiallyActive('Pyro')).toBe(true);
  });

  it('isSystemPartiallyActive should return false when all are active', () => {
    service.toggleSystem('Pyro');
    expect(service.isSystemPartiallyActive('Pyro')).toBe(false);
  });
});
