import { Component, input, signal } from '@angular/core';

export interface TabItem {
  id: string;
  label: string;
}

@Component({
  selector: 'app-tab-group',
  imports: [],
  templateUrl: './tab-group.html',
  styleUrl: './tab-group.scss',
})
export class TabGroup {
  tabs = input<TabItem[]>([]);
  active = signal<string | null>('invites');

  select(id: string) {
    this.active.set(id);
  }
}
