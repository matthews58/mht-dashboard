import { Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { InvitePlayersDialog } from '../invite-players-dialog/invite-players-dialog';
import { UserStore } from '../../users/user.store';
import { TeamStore } from '../../teams/team.store';
import { CoachInviteStore } from '../coach-invite.store';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-coach-invite-list',
  imports: [
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './coach-invite-list.html',
  styleUrl: './coach-invite-list.scss',
})
export class CoachInviteList {
  #coachInviteStore = inject(CoachInviteStore);
  #userStore = inject(UserStore);
  #teamStore = inject(TeamStore);
  #dialogService = inject(MatDialog);

  paginator = viewChild(MatPaginator);
  sort = viewChild(MatSort);
  displayedColumns = ['player', 'email', 'team', 'status'];

  filterText = signal('');

  invites = this.#coachInviteStore.coachInvites;
  isLoading = this.#coachInviteStore.isLoading;
  error = this.#coachInviteStore.error;

  filteredInvites = computed(() => {
    const filter = this.filterText().toLowerCase();
    const invites = this.invites();
    if (!invites) {
      return [];
    }

    return invites.filter(
      (invite) =>
        invite.player.toLowerCase().includes(filter) ||
        invite.email.toLowerCase().includes(filter) ||
        invite.team.toLowerCase().includes(filter)
    );
  });

  dataSource = computed(() => {
    const invites = new MatTableDataSource(this.filteredInvites());
    invites.sort = this.sort();
    return invites;
  });

  constructor() {
    this.#coachInviteStore.load();
  }

  invitePlayers() {
    this.#dialogService.open(InvitePlayersDialog, {
      autoFocus: false,
      disableClose: true,
      width: '500px',
      maxWidth: '100vw',
      data: {
        users: this.#userStore.users,
        teams: this.#teamStore.teams,
      },
    });
  }
}
