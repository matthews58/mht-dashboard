import { Component, inject } from '@angular/core';
import { CoachInviteList } from '../coach-invites/coach-invite-list/coach-invite-list';
import { DashboardStore } from './dashboard.store';
import { TabGroup } from '../shared/tab-group/tab-group';
import { Tab } from '../shared/tab-group/tab';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-dashboard',
  imports: [TabGroup, Tab, CoachInviteList, MatProgressSpinnerModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  #dashboardStore = inject(DashboardStore);

  isLoading = this.#dashboardStore.isLoading;
  coachInvites = this.#dashboardStore.coachInvites;
  error = this.#dashboardStore.error;
}
