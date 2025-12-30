import { computed, inject, Injectable } from '@angular/core';
import { patchState, signalState } from '@ngrx/signals';
import { HttpErrorResponse } from '@angular/common/http';
import { sortBy } from 'lodash';
import { Subject } from 'rxjs';
import { VideoAssignment, VideoAssignmentRequest, VideoAssignmentsResponse } from './video-assignment';
import { VideoAssignmentService } from './video-assignment.service';

type VideoAssignmentState = {
  videoAssignments: VideoAssignment[];
  isLoading: boolean;
  error: string | null;
};

const initialState: VideoAssignmentState = {
  videoAssignments: [],
  isLoading: true,
  error: null,
};

export type VideoAssignmentEvent =
  | { type: 'video-assignment-added'; videoAssignment: VideoAssignment }
  | { type: 'video-assignment-failed'; error: string };

@Injectable({
  providedIn: 'root',
})
export class VideoAssignmentStore {
  #service = inject(VideoAssignmentService);
  #state = signalState(initialState);
  #events = new Subject<VideoAssignmentEvent>();

  events = this.#events.asObservable();

  videoAssignments = computed(() =>
    sortBy(this.#state.videoAssignments(), (videoAssignment) =>
      videoAssignment.title.toLocaleLowerCase()
    )
  );
  isLoading = this.#state.isLoading;
  error = this.#state.error;

  load() {
    patchState(this.#state, { isLoading: true });

    this.#service.getVideoAssignments().subscribe({
      next: (response: VideoAssignmentsResponse) => {
        const videoAssignments = response.videos;
        patchState(this.#state, { videoAssignments, isLoading: false });
      },
      error: (err: HttpErrorResponse) =>
        patchState(this.#state, {
          error: err.error?.message ?? 'Failed to load video assignments',
          isLoading: false,
        }),
    });
  }

  createVideoAssignment(videoAssignmentRequest: VideoAssignmentRequest) {
    this.#service.createVideoAssignment(videoAssignmentRequest).subscribe({
      next: (videoAssignment) => {
        patchState(this.#state, (s) => ({
          videoAssignments: [...(s.videoAssignments ?? []), videoAssignment],
          isLoading: false,
        }));

        this.#events.next({ type: 'video-assignment-added', videoAssignment });
      },
      error: (err: HttpErrorResponse) => {
        this.#events.next({
          type: 'video-assignment-failed',
          error: err.error?.message ?? 'Failed to create video assignment',
        });
      }
    });
  }
}
