import { computed, inject, Injectable } from '@angular/core';
import { patchState, signalState } from '@ngrx/signals';
import { HttpErrorResponse } from '@angular/common/http';
import { sortBy } from 'lodash';
import { CoachInvite, SendCoachInviteRequest, SendCoachInviteResponse } from './coach-invite';
import { CoachInviteService } from './coach-invite.service';
import { Subject } from 'rxjs';

type CoachInviteState = {
  coachInvites: CoachInvite[];
  isLoading: boolean;
  error: string | null;
};

const initialState: CoachInviteState = {
  coachInvites: [],
  isLoading: true,
  error: null
};

export type CoachInviteEvent =
  | { type: 'invite-sent'; invites: CoachInvite[] }
  | { type: 'invite-accepted'; inviteId: string }
  | { type: 'invite-failed'; error: string };

@Injectable({
  providedIn: 'root',
})
export class CoachInviteStore {
  #service = inject(CoachInviteService);
  #state = signalState(initialState);
  #events = new Subject<CoachInviteEvent>();

  events = this.#events.asObservable();

  coachInvites = computed(() =>
    sortBy(this.#state.coachInvites(), (invite) => invite.player.toLocaleLowerCase())
  );
  isLoading = this.#state.isLoading;
  error = this.#state.error;

  load() {
    patchState(this.#state, { isLoading: true });

    this.#service.getCoachInvites().subscribe({
      next: (coachInvites: CoachInvite[]) => {
        patchState(this.#state, { coachInvites, isLoading: false });
      },
      error: (err: HttpErrorResponse) =>
        patchState(this.#state, {
          error: err.error?.message ?? 'Failed to load invites',
          isLoading: false,
        }),
    });
  }

  sendInvites(request: SendCoachInviteRequest) {
    this.#service.sendCoachInvites(request).subscribe({
      next: (response: SendCoachInviteResponse[]) => {        
        const newInvites: CoachInvite[] = response
          .filter((r) => r.success)
          .map((r) => ({
            id: r.id!,
            player: r.player ?? '',
            email: r.email!,
            team: r.team!,
            status: 'Pending',
            invitedAt: r.invitedAt!,
          }));

        patchState(this.#state, (s) => ({
          coachInvites: [...(s.coachInvites ?? []), ...newInvites],
          isLoading: false,
        }));

        this.#events.next({ type: 'invite-sent', invites: newInvites });
      },
      error: (err: HttpErrorResponse) => {
        this.#events.next({
          type: 'invite-failed',
          error: err.error?.message ?? 'Failed to send invites',
        });
      },
    });
  }
}
