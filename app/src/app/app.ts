import { Component, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Dashboard } from './dashboard/dashboard';
import { MatIconRegistry } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  imports: [Dashboard, MatProgressSpinnerModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private matIconRegistry = inject(MatIconRegistry);

  constructor() {
    this.matIconRegistry.setDefaultFontSetClass('material-symbols-outlined');
  }
}