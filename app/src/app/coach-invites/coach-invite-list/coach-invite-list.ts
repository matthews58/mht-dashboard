import { Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { CoachInvite } from '../coach-invite';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { InvitePlayersDialog } from '../invite-players-dialog/invite-players-dialog';

@Component({
  selector: 'app-coach-invite-list',
  imports: [
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatToolbarModule,
    MatButtonModule,
    DatePipe,
  ],
  templateUrl: './coach-invite-list.html',
  styleUrl: './coach-invite-list.scss',
})
export class CoachInviteList {
  #dialogService = inject(MatDialog);

  coachInvites = input<CoachInvite[]>();

  paginator = viewChild(MatPaginator);
  sort = viewChild(MatSort);
  displayedColumns = ['player', 'email', 'team', 'status', 'invitedAt', 'acceptedAt'];

  filterText = signal('');

  filteredInvites = computed(() => {
    const filter = this.filterText().toLowerCase();
    const invites = this.coachInvites();
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

  invitePlayers() {
    this.#dialogService.open(InvitePlayersDialog, {
      width: '400px',
      maxWidth: '100vw',
      maxHeight: 'min(100vh, 400px)',
    });
  }
}
