import { TestBed } from '@angular/core/testing';
import { MaterialStorageService } from './material-storage.service';

describe('MaterialStorageService', () => {
  let service: MaterialStorageService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(MaterialStorageService);
  });

  it('should start with an empty list when localStorage is empty', () => {
    expect(service.getAll()).toEqual([]);
  });

  it('add() should create a record with a unique id', () => {
    const record = service.add({ material: 'AGC', quality: 800, quantity: 10, location: 'Port Tressler' });
    expect(record.id).toBeTruthy();
    expect(service.getAll()).toHaveLength(1);
    expect(service.getAll()[0].material).toBe('AGC');
  });

  it('add() should assign distinct ids to multiple records', () => {
    const a = service.add({ material: 'AGC', quality: 700, quantity: 5, location: 'Port Tressler' });
    const b = service.add({ material: 'AGC', quality: 800, quantity: 5, location: 'Port Tressler' });
    expect(a.id).not.toBe(b.id);
    expect(service.getAll()).toHaveLength(2);
  });

  it('add() should merge quantity when same material, quality, and location already exist', () => {
    service.add({ material: 'AGC', quality: 800, quantity: 10, location: 'Port Tressler' });
    service.add({ material: 'AGC', quality: 800, quantity: 5,  location: 'Port Tressler' });
    expect(service.getAll()).toHaveLength(1);
    expect(service.getAll()[0].quantity).toBe(15);
  });

  it('add() should not merge when quality differs', () => {
    service.add({ material: 'AGC', quality: 800, quantity: 10, location: 'Port Tressler' });
    service.add({ material: 'AGC', quality: 900, quantity: 5,  location: 'Port Tressler' });
    expect(service.getAll()).toHaveLength(2);
  });

  it('add() should not merge when location differs', () => {
    service.add({ material: 'AGC', quality: 800, quantity: 10, location: 'Port Tressler' });
    service.add({ material: 'AGC', quality: 800, quantity: 5,  location: 'CRU-L1' });
    expect(service.getAll()).toHaveLength(2);
  });

  it('remove() should delete the record with the given id', () => {
    const record = service.add({ material: 'AGC', quality: 800, quantity: 10, location: 'Port Tressler' });
    service.remove(record.id);
    expect(service.getAll()).toHaveLength(0);
  });

  it('remove() should only remove the targeted record', () => {
    const a = service.add({ material: 'AGC', quality: 700, quantity: 5, location: 'A' });
    const b = service.add({ material: 'BXA', quality: 900, quantity: 3, location: 'B' });
    service.remove(a.id);
    expect(service.getAll()).toHaveLength(1);
    expect(service.getAll()[0].id).toBe(b.id);
  });

  it('remove() with unknown id should leave records unchanged', () => {
    service.add({ material: 'AGC', quality: 800, quantity: 10, location: 'A' });
    service.remove('non-existent-id');
    expect(service.getAll()).toHaveLength(1);
  });

  it('updateQuantity() should change only the quantity of the target record', () => {
    const record = service.add({ material: 'AGC', quality: 800, quantity: 10, location: 'A' });
    service.updateQuantity(record.id, 4);
    expect(service.getAll()[0].quantity).toBe(4);
    expect(service.getAll()[0].material).toBe('AGC');
  });

  it('updateLocation() should change location for all given ids', () => {
    const a = service.add({ material: 'AGC', quality: 700, quantity: 5, location: 'A' });
    const b = service.add({ material: 'BXA', quality: 900, quantity: 3, location: 'B' });
    service.updateLocation([a.id, b.id], 'New Station');
    expect(service.getAll().every(r => r.location === 'New Station')).toBe(true);
  });

  it('updateLocation() should not affect records not in the id list', () => {
    const a = service.add({ material: 'AGC', quality: 700, quantity: 5, location: 'A' });
    const b = service.add({ material: 'BXA', quality: 900, quantity: 3, location: 'B' });
    service.updateLocation([a.id], 'New Station');
    expect(service.getAll().find(r => r.id === b.id)?.location).toBe('B');
  });

  it('replaceAll() should overwrite existing records', () => {
    service.add({ material: 'AGC', quality: 700, quantity: 5, location: 'A' });
    service.replaceAll([{ material: 'BXA', quality: 900, quantity: 3, location: 'B' }]);
    expect(service.getAll()).toHaveLength(1);
    expect(service.getAll()[0].material).toBe('BXA');
  });

  it('replaceAll() should assign new ids to imported records', () => {
    service.replaceAll([{ material: 'AGC', quality: 700, quantity: 5, location: 'A' }]);
    expect(service.getAll()[0].id).toBeTruthy();
  });

  it('records signal should reflect the latest state', () => {
    service.add({ material: 'AGC', quality: 800, quantity: 10, location: 'A' });
    expect(service.records()).toHaveLength(1);
    service.remove(service.records()[0].id);
    expect(service.records()).toHaveLength(0);
  });

  it('should persist data to localStorage on add', () => {
    service.add({ material: 'AGC', quality: 800, quantity: 10, location: 'A' });
    const stored = JSON.parse(localStorage.getItem('sc_materials')!);
    expect(stored).toHaveLength(1);
  });

  it('should load persisted data on construction', () => {
    service.add({ material: 'AGC', quality: 800, quantity: 10, location: 'A' });
    // Create a new instance to simulate a page reload
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const fresh = TestBed.inject(MaterialStorageService);
    expect(fresh.getAll()).toHaveLength(1);
    expect(fresh.getAll()[0].material).toBe('AGC');
  });

  // ── undo / removeMany ─────────────────────────────────────

  it('remove() should store the deleted record in lastDeleted', () => {
    const record = service.add({ material: 'AGC', quality: 800, quantity: 10, location: 'A' });
    service.remove(record.id);
    expect(service.lastDeleted()).toHaveLength(1);
    expect(service.lastDeleted()[0].id).toBe(record.id);
  });

  it('undoDelete() should restore the last deleted record', () => {
    const record = service.add({ material: 'AGC', quality: 800, quantity: 10, location: 'A' });
    service.remove(record.id);
    service.undoDelete();
    expect(service.getAll()).toHaveLength(1);
    expect(service.getAll()[0].id).toBe(record.id);
  });

  it('undoDelete() should clear lastDeleted after restoring', () => {
    const record = service.add({ material: 'AGC', quality: 800, quantity: 10, location: 'A' });
    service.remove(record.id);
    service.undoDelete();
    expect(service.lastDeleted()).toHaveLength(0);
  });

  it('undoDelete() should do nothing when lastDeleted is empty', () => {
    service.add({ material: 'AGC', quality: 800, quantity: 10, location: 'A' });
    service.undoDelete();
    expect(service.getAll()).toHaveLength(1);
  });

  it('remove() twice should only keep the most recent deleted record in lastDeleted', () => {
    const a = service.add({ material: 'AGC', quality: 700, quantity: 5, location: 'A' });
    const b = service.add({ material: 'BXA', quality: 900, quantity: 3, location: 'B' });
    service.remove(a.id);
    service.remove(b.id);
    expect(service.lastDeleted()).toHaveLength(1);
    expect(service.lastDeleted()[0].id).toBe(b.id);
  });

  it('removeMany() should delete all given records', () => {
    const a = service.add({ material: 'AGC', quality: 700, quantity: 5, location: 'A' });
    const b = service.add({ material: 'BXA', quality: 900, quantity: 3, location: 'B' });
    const c = service.add({ material: 'TIT', quality: 800, quantity: 2, location: 'C' });
    service.removeMany([a.id, b.id]);
    expect(service.getAll()).toHaveLength(1);
    expect(service.getAll()[0].id).toBe(c.id);
  });

  it('removeMany() should store all deleted records in lastDeleted', () => {
    const a = service.add({ material: 'AGC', quality: 700, quantity: 5, location: 'A' });
    const b = service.add({ material: 'BXA', quality: 900, quantity: 3, location: 'B' });
    service.removeMany([a.id, b.id]);
    expect(service.lastDeleted()).toHaveLength(2);
  });

  it('undoDelete() should restore all records deleted by removeMany()', () => {
    const a = service.add({ material: 'AGC', quality: 700, quantity: 5, location: 'A' });
    const b = service.add({ material: 'BXA', quality: 900, quantity: 3, location: 'B' });
    service.removeMany([a.id, b.id]);
    service.undoDelete();
    expect(service.getAll()).toHaveLength(2);
  });
});
