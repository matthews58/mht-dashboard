import { CommonModule } from '@angular/common';
import { Component, computed, inject, Signal, signal, viewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule, MatChipInputEvent, MatChipInput } from '@angular/material/chips';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ENTER } from '@angular/cdk/keycodes';
import { MatSelectModule } from '@angular/material/select';
import { Team } from '../../teams/team.service';
import { User } from '../../users/user.service';
import { CoachInviteStore } from '../coach-invite.store';
import { SendCoachInviteRequest } from '../coach-invite';
import { filter } from 'rxjs';
import { SnackbarService } from '../../shared/snackbar/snackbar.service';

type Invitee = {
  type: 'existing' | 'new';
  email: string;
  playerId?: string;
  fullName?: string;
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

@Component({
  selector: 'app-invite-players-dialog',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
  ],
  templateUrl: './invite-players-dialog.html',
  styleUrl: './invite-players-dialog.scss',
})
export class InvitePlayersDialog {
  #coachInviteStore = inject(CoachInviteStore);
  #dialogRef = inject(MatDialogRef);
  #snackBar = inject(SnackbarService);
  
  #data: { users: Signal<User[]>; teams: Signal<Team[]> } = inject(MAT_DIALOG_DATA);
  chipInput = viewChild<MatChipInput>('chipInput');

  invitees = signal<Invitee[]>([]);
  teams = this.#data.teams;
  teamControl = new FormControl<string | null>(
    this.#data.teams.length === 1 ? this.#data.teams()[0].id : null
  );

  inputControl = new FormControl('', { nonNullable: true });
  inputValue = toSignal(this.inputControl.valueChanges, { initialValue: '' });

  separatorKeys = [ENTER];

  filteredUsers = computed(() => {
    const term = this.#getInputText().trim().toLowerCase();
    const selectedEmails = new Set(this.invitees().map((i) => i.email.toLowerCase()));

    return this.#data
      .users()
      .filter(
        (user) =>
          !selectedEmails.has(user.email.toLowerCase()) &&
          (!term ||
            user.fullName.toLowerCase().includes(term) ||
            user.email.toLowerCase().includes(term))
      );
  });

  canAddNewEmail = computed(() => this.#canUseEmail(this.#getInputText().trim()));

  constructor() {
    this.#coachInviteStore.events
      .pipe(
        filter((e) => e.type === 'invite-sent' || e.type === 'invite-failed'),
        takeUntilDestroyed()
      )
      .subscribe(e => {
        if (e.type === 'invite-failed') {
          this.#snackBar.error(e.error);
          return;
        }

        if (e.type === 'invite-sent') {
          this.#snackBar.success('Invites sent successfully');
          this.#dialogRef.close();
        }
      });
  }

  handleOptionSelected(event: MatAutocompleteSelectedEvent) {
    const value = event.option.value;
    if (typeof value === 'string') {
      this.addEmailFromInput(value);
    } else {
      const user = value as User;
      this.invitees.update((list) => [
        ...list,
        { type: 'existing', email: user.email, playerId: user.id, fullName: user.fullName },
      ]);
    }

    this.#resetInput();
  }

  addEmailFromInput(email?: string) {
    const value = (email ?? this.#getInputText()).trim();

    if (!this.#canUseEmail(value)) return;

    this.invitees.update((list) => [...list, { type: 'new', email: value }]);
    this.#resetInput();
  }

  handleChipInput(event: MatChipInputEvent) {
    const value = (event.value || '').trim();
    if (value && this.#canUseEmail(value)) {
      this.invitees.update((list) => [...list, { type: 'new', email: value }]);
    }

    event.chipInput?.clear();
    this.#resetInput();
  }

  removeInvitee(invitee: Invitee) {
    this.invitees.update((list) => list.filter((i) => i.email !== invitee.email));
  }

  submit() {
    if (!this.invitees().length || !this.teamControl.value) {
      return;
    }

    const request: SendCoachInviteRequest = {
      teamId: this.teamControl.value,
      invites: this.invitees().map((invitee) => ({
        player: invitee.playerId,
        email: invitee.email,
      })),
    };

    this.#coachInviteStore.sendInvites(request);
  }

  trackInvitee(_: number, invitee: Invitee) {
    return invitee.email;
  }

  #canUseEmail(value: string) {
    if (!value || !EMAIL_REGEX.test(value)) return false;
    const lower = value.toLowerCase();
    return (
      !this.#data.users().some((user) => user.email.toLowerCase() === lower) &&
      !this.invitees().some((invitee) => invitee.email.toLowerCase() === lower)
    );
  }

  #getInputText() {
    const value = this.inputValue();
    return typeof value === 'string' ? value : '';
  }

  #resetInput() {
    setTimeout(() => {
      this.inputControl.reset('', { emitEvent: true });
      this.chipInput()?.clear();
    }, 0);
  }
}
