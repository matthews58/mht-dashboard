import { computed, effect, inject, Injectable } from '@angular/core';
import { patchState, signalState } from '@ngrx/signals';
import { HttpErrorResponse } from '@angular/common/http';
import { sortBy } from 'lodash';
import { CoachInvite } from '../coach-invites/coach-invite';
import { DashboardService } from './dashboard.service';

type CoachInviteState = {
  coachInvites: CoachInvite[] | null;
  isLoading: boolean;
  error: string | null;
};

const initialState: CoachInviteState = {
  coachInvites: null,
  isLoading: true,
  error: null
};

@Injectable({
  providedIn: 'root',
})
export class DashboardStore {
  #service = inject(DashboardService);
  #state = signalState(initialState);

  coachInvites = computed(() =>
    sortBy(this.#state.coachInvites(), (invite) => invite.email.toLocaleLowerCase())
  );
  isLoading = this.#state.isLoading;
  error = this.#state.error;

  constructor() {
    effect(() => {
      this.#service.getCoachInvites().subscribe({
        next: (coachInvites: CoachInvite[]) => {
          patchState(this.#state, { coachInvites, isLoading: false, error: null });
        },
        error: (error: HttpErrorResponse) => {
          console.log(error);

          patchState(this.#state, {
            coachInvites: null,
            isLoading: false,
            error: error.error?.message ?? 'Failed to load coach invites',
          });
        },
      });
    });
  }
}
