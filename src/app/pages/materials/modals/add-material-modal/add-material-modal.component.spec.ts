import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddMaterialModalComponent } from './add-material-modal.component';
import { MaterialStorageService } from '../../../../services/material-storage.service';
import { StationFilterService } from '../../../../services/station-filter.service';

describe('AddMaterialModalComponent', () => {
  let component: AddMaterialModalComponent;
  let fixture: ComponentFixture<AddMaterialModalComponent>;
  let filter: StationFilterService;
  let storage: MaterialStorageService;

  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AddMaterialModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddMaterialModalComponent);
    component = fixture.componentInstance;
    filter   = TestBed.inject(StationFilterService);
    storage  = TestBed.inject(MaterialStorageService);
    fixture.detectChanges();
  });

  // ── locationDropdownItems ─────────────────────────────────────────────────

  it('locationDropdownItems should show all locations when query is empty and no stations are active', () => {
    component.locationInputText.set('');
    const items = component.locationDropdownItems();
    expect(items.length).toBe(filter.allLocations().length);
    expect(items.every(i => !i.isActive)).toBe(true);
  });

  it('locationDropdownItems should show only active stations when query is empty and stations are active', () => {
    filter.toggleStation('Port Tressler');
    filter.toggleStation('CRU-L1');
    component.locationInputText.set('');
    const items = component.locationDropdownItems();
    expect(items).toHaveLength(2);
    expect(items.every(i => i.isActive)).toBe(true);
    expect(items.map(i => i.loc.name).sort()).toEqual(['CRU-L1', 'Port Tressler'].sort());
  });

  it('locationDropdownItems should filter locations by query string', () => {
    component.locationInputText.set('port');
    const items = component.locationDropdownItems();
    expect(items.length).toBeGreaterThan(0);
    expect(items.every(i => i.loc.name.toLowerCase().includes('port'))).toBe(true);
  });

  it('locationDropdownItems should place active matches before inactive ones when query is present', () => {
    filter.toggleStation('MIC-L1');
    component.locationInputText.set('l1'); // matches ARC-L1, CRU-L1, MIC-L1, etc.
    const items = component.locationDropdownItems();
    const firstInactiveIndex = items.findIndex(i => !i.isActive);
    items
      .filter(i => i.isActive)
      .forEach(active => {
        if (firstInactiveIndex >= 0) {
          expect(items.indexOf(active)).toBeLessThan(firstInactiveIndex);
        }
      });
  });

  it('locationDropdownItems should return empty list when query matches nothing', () => {
    component.locationInputText.set('xyzzy9999notexist');
    expect(component.locationDropdownItems()).toEqual([]);
  });

  it('locationDropdownItems should mark matching active station as isActive', () => {
    filter.toggleStation('Port Tressler');
    component.locationInputText.set('port');
    const items = component.locationDropdownItems();
    const portItem = items.find(i => i.loc.name === 'Port Tressler');
    expect(portItem).toBeTruthy();
    expect(portItem!.isActive).toBe(true);
  });

  // ── selectLocation ────────────────────────────────────────────────────────

  it('selectLocation() should set locationCtrl to the selected name', () => {
    component.selectLocation('Port Tressler');
    expect(component.locationCtrl.value).toBe('Port Tressler');
  });

  it('selectLocation() should update locationInputText', () => {
    component.selectLocation('CRU-L1');
    expect(component.locationInputText()).toBe('CRU-L1');
  });

  it('selectLocation() should close the dropdown', () => {
    component.locationDropdownOpen.set(true);
    component.selectLocation('Port Tressler');
    expect(component.locationDropdownOpen()).toBe(false);
  });

  // ── onLocationInput ───────────────────────────────────────────────────────

  it('onLocationInput() should update locationInputText', () => {
    component.onLocationInput('Cru');
    expect(component.locationInputText()).toBe('Cru');
  });

  it('onLocationInput() should open the dropdown', () => {
    component.locationDropdownOpen.set(false);
    component.onLocationInput('any');
    expect(component.locationDropdownOpen()).toBe(true);
  });

  it('onLocationInput() should clear locationCtrl value', () => {
    component.locationCtrl.setValue('Old Value');
    component.onLocationInput('new');
    expect(component.locationCtrl.value).toBe('');
  });

  // ── onAdd ─────────────────────────────────────────────────────────────────

  it('onAdd() should not call storage.add() when form is invalid', () => {
    const spy = vi.spyOn(storage, 'add');
    component.onAdd();
    expect(spy).not.toHaveBeenCalled();
  });

  it('onAdd() should call storage.add() with form values when valid', () => {
    const spy = vi.spyOn(storage, 'add');
    component.materialCtrl.setValue('AGC');
    component.qualityCtrl.setValue(800);
    component.quantityCtrl.setValue(10);
    component.locationCtrl.setValue('Port Tressler');
    component.onAdd();
    expect(spy).toHaveBeenCalledWith({ material: 'AGC', quality: 800, quantity: 10, location: 'Port Tressler' });
  });

  it('onAdd() should emit recorded(false) by default', () => {
    const spy = vi.spyOn(component.recorded, 'emit');
    component.materialCtrl.setValue('AGC');
    component.qualityCtrl.setValue(800);
    component.quantityCtrl.setValue(10);
    component.locationCtrl.setValue('Port Tressler');
    component.onAdd();
    expect(spy).toHaveBeenCalledWith(false);
  });

  it('onAdd() should retain material and location after submission', () => {
    component.materialCtrl.setValue('AGC');
    component.qualityCtrl.setValue(800);
    component.quantityCtrl.setValue(10);
    component.locationCtrl.setValue('Port Tressler');
    component.onAdd();
    expect(component.materialCtrl.value).toBe('AGC');
    expect(component.locationCtrl.value).toBe('Port Tressler');
    expect(component.locationInputText()).toBe('Port Tressler');
  });
});
