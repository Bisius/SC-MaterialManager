import { Routes } from '@angular/router';
import { MaterialsComponent } from './pages/materials/materials.component';

export const routes: Routes = [
  { path: '', component: MaterialsComponent },
  { path: '**', redirectTo: '' },
];
