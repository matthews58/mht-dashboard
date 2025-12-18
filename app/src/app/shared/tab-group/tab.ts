import { Component, input, inject, computed } from '@angular/core';
import { TabGroup } from './tab-group';

@Component({
  selector: 'app-tab',
  imports: [],
  template: `
    @if (isActive()) {
        <ng-content />
    }
  `,
})
export class Tab {
  id = input.required<string>();
  group = inject(TabGroup);

  isActive = computed(() => this.group.active() === this.id());
}
