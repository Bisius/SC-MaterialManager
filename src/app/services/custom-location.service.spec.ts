import { TestBed } from '@angular/core/testing';
import { CustomLocationService } from './custom-location.service';
import { LocationType } from '../data/locations';

describe('CustomLocationService', () => {
  let service: CustomLocationService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomLocationService);
  });

  it('should start with no custom locations when localStorage is empty', () => {
    expect(service.customLocations()).toEqual([]);
  });

  it('add() should append a location with the correct fields', () => {
    service.add('My Station', 'Stanton', false);
    const locs = service.customLocations();
    expect(locs).toHaveLength(1);
    expect(locs[0].name).toBe('My Station');
    expect(locs[0].system).toBe('Stanton');
    expect(locs[0].type).toBe(LocationType.Station);
    expect(locs[0].refinery).toBe(false);
  });

  it('add() should set refinery flag correctly', () => {
    service.add('Refinery Base', 'Pyro', true);
    expect(service.customLocations()[0].refinery).toBe(true);
  });

  it('add() should accumulate multiple locations', () => {
    service.add('Alpha', 'Stanton', false);
    service.add('Beta', 'Pyro', true);
    expect(service.customLocations()).toHaveLength(2);
  });

  it('remove() should delete the location with the given name', () => {
    service.add('Alpha', 'Stanton', false);
    service.add('Beta', 'Pyro', true);
    service.remove('Alpha');
    const locs = service.customLocations();
    expect(locs).toHaveLength(1);
    expect(locs[0].name).toBe('Beta');
  });

  it('remove() with an unknown name should leave locations unchanged', () => {
    service.add('Alpha', 'Stanton', false);
    service.remove('Nonexistent');
    expect(service.customLocations()).toHaveLength(1);
  });

  it('should persist data to localStorage on add', () => {
    service.add('My Station', 'Stanton', false);
    const stored = JSON.parse(localStorage.getItem('sc_custom_locations')!);
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('My Station');
  });

  it('should persist after remove', () => {
    service.add('Alpha', 'Stanton', false);
    service.remove('Alpha');
    const stored = JSON.parse(localStorage.getItem('sc_custom_locations')!);
    expect(stored).toHaveLength(0);
  });

  it('should load persisted data on construction', () => {
    service.add('My Station', 'Stanton', false);
    // Simulate page reload
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const fresh = TestBed.inject(CustomLocationService);
    expect(fresh.customLocations()).toHaveLength(1);
    expect(fresh.customLocations()[0].name).toBe('My Station');
  });
});
