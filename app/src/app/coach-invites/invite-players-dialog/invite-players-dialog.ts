import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule, MatChipInputEvent } from '@angular/material/chips';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

export interface InvitePlayerForm {
  teamId: number;
  invitees: Invitee[];
}

type Invitee =
  | { type: 'existing'; userId: string; email: string; name: string }
  | { type: 'new'; email: string };

export interface ExistingUser {
  id: string;
  fullName: string;
  email: string;
}

export interface InvitePlayersDialogData {
  teamId?: number;
  existingUsers?: ExistingUser[];
}

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
  ],
  templateUrl: './invite-players-dialog.html',
  styleUrl: './invite-players-dialog.scss',
})
export class InvitePlayersDialog {
  #dialogRef = inject(MatDialogRef<InvitePlayersDialog, InvitePlayerForm>);
  #data = inject(MAT_DIALOG_DATA, { optional: true }) as InvitePlayersDialogData | null;

  teamId = this.#data?.teamId ?? 0;
  existingUsers = signal<ExistingUser[]>(this.#data?.existingUsers ?? []);

  inputControl = new FormControl('', { nonNullable: true });
  inputValue = toSignal(this.inputControl.valueChanges, { initialValue: '' });

  invitees = signal<Invitee[]>([]);

  separatorKeys = [ENTER, COMMA];

  filteredUsers = computed(() => {
    const term = this.inputValue().trim().toLowerCase();
    const selectedEmails = new Set(this.invitees().map((i) => i.email.toLowerCase()));

    return this.existingUsers().filter(
      (user) =>
        !selectedEmails.has(user.email.toLowerCase()) &&
        (!term ||
          user.fullName.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term))
    );
  });

  canAddNewEmail = computed(() => this.#canUseEmail(this.inputValue().trim()));

  selectExisting(event: MatAutocompleteSelectedEvent) {
    const user = event.option.value as ExistingUser | undefined;
    if (!user) return;

    this.invitees.update((list) => [
      ...list,
      { type: 'existing', userId: user.id, email: user.email, name: user.fullName },
    ]);
    this.inputControl.setValue('');
  }

  addEmailFromInput() {
    const value = this.inputValue().trim();
    if (!this.#canUseEmail(value)) return;

    this.invitees.update((list) => [...list, { type: 'new', email: value }]);
    this.inputControl.setValue('');
  }

  handleChipInput(event: MatChipInputEvent) {
    const value = (event.value || '').trim();
    if (value && this.#canUseEmail(value)) {
      this.invitees.update((list) => [...list, { type: 'new', email: value }]);
    }

    event.chipInput?.clear();
    this.inputControl.setValue('');
  }

  removeInvitee(invitee: Invitee) {
    this.invitees.update((list) => list.filter((i) => i.email !== invitee.email));
  }

  submit() {
    if (!this.invitees().length) {
      return;
    }

    this.#dialogRef.close({
      teamId: this.teamId,
      invitees: this.invitees(),
    });
  }

  trackInvitee(_: number, invitee: Invitee) {
    return invitee.email;
  }

  #canUseEmail(value: string) {
    if (!value || !EMAIL_REGEX.test(value)) return false;
    const lower = value.toLowerCase();
    return (
      !this.existingUsers().some((user) => user.email.toLowerCase() === lower) &&
      !this.invitees().some((invitee) => invitee.email.toLowerCase() === lower)
    );
  }
}
