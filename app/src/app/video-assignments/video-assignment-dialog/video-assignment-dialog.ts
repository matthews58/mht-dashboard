import { Component, ElementRef, OnDestroy, computed, effect, inject, linkedSignal, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Field, form } from '@angular/forms/signals';
import { QuizQuestionChoice, VideoAssignment, VideoAssignmentEntry, initialData, readOnlyVideoAssignmentSchema, videoAssignmentSchema } from '../video-assignment';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { VideoAssignmentStore } from '../video-assignment.store';
import { User } from '../../users/user.service';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatChipInput, MatChipsModule } from '@angular/material/chips';
import { ENTER } from '@angular/cdk/keycodes';
import { MatSelectModule } from '@angular/material/select';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { MatSliderModule } from '@angular/material/slider';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { SnackbarService } from '../../shared/snackbar/snackbar.service';

@Component({
  selector: 'app-video-assignment-dialog',
  imports: [
    MatDialogModule,
    MatInputModule,
    Field,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatDividerModule,
    MatCardModule,
    MatSliderModule,
  ],
  templateUrl: './video-assignment-dialog.html',
  styleUrl: './video-assignment-dialog.scss',
})
export class VideoAssignmentDialog implements OnDestroy {
  #videoAssignmentStore = inject(VideoAssignmentStore);
  #dialogRef = inject(MatDialogRef);
  #snackBar = inject(SnackbarService);

  #data: { players: User[]; coaches: User[]; video?: VideoAssignment } = inject(MAT_DIALOG_DATA);

  videoAssignmentModel = signal<VideoAssignmentEntry>(initialData);
  videoAssignmentFormModel = linkedSignal({
    source: computed(() => this.#data.video),
    computation: (video: VideoAssignment | undefined) =>
      video ? this.videoAssignmentToEntry(video) : this.videoAssignmentModel(),
  });
  videoAssignmentFormSchema = linkedSignal({
    source: computed(() => this.#data.video),
    computation: (video: VideoAssignment | undefined) =>
      video ? readOnlyVideoAssignmentSchema : videoAssignmentSchema,
  });
  videoAssignmentForm = form(this.videoAssignmentFormModel, this.videoAssignmentFormSchema());

  videoPreviewUrl = signal<string | null>(null);
  videoDuration = signal(0);
  #videoObjectUrl: string | null = null;
  videoElement = viewChild<ElementRef<HTMLVideoElement>>('previewVideo');

  separatorKeys = [ENTER];

  playerInputText = signal('');
  playerChipInput = viewChild<MatChipInput>('playerChipInput');
  playerAutoCompleteTrigger = viewChild<MatAutocompleteTrigger>('playerAutoCompleteTrigger');

  filteredPlayers = computed(() => {
    const inputText = this.playerInputText().trim().toLowerCase();
    const selectedPlayerIds = new Set(
      this.videoAssignmentFormModel().assignedPlayers.map((p) => p.id)
    );

    return this.#data.players.filter(
      (player) =>
        !selectedPlayerIds.has(player.id) &&
        (!inputText || player.fullName.toLowerCase().includes(inputText))
    );
  });

  coachInputText = signal('');
  coachChipInput = viewChild<MatChipInput>('coachChipInput');

  filteredCoaches = computed(() => {
    const inputText = this.coachInputText().trim().toLowerCase();
    const selectedCoachIds = new Set(
      this.videoAssignmentFormModel().managingCoaches.map((c) => c.id)
    );

    return this.#data.coaches.filter(
      (coach) =>
        !selectedCoachIds.has(coach.id) &&
        (!inputText || coach.fullName.toLowerCase().includes(inputText))
    );
  });

  constructor() {
    this.#videoAssignmentStore.events
      .pipe(
        filter((e) => e.type === 'video-assignment-added' || e.type === 'video-assignment-failed'),
        takeUntilDestroyed()
      )
      .subscribe((e) => {
        if (e.type === 'video-assignment-failed') {
          this.#snackBar.error(e.error);
          return;
        }

        if (e.type === 'video-assignment-added') {
          this.#snackBar.success('Video assignment successfully added');
          this.#dialogRef.close();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.#videoObjectUrl) {
      URL.revokeObjectURL(this.#videoObjectUrl);
      this.#videoObjectUrl = null;
    }
  }

  onFileSelected(event: any) {
    const file = event?.target?.files?.[0] ?? null;
    this.videoAssignmentFormModel.update((current) => ({
      ...current,
      file,
    }));

    if (this.#videoObjectUrl) {
      URL.revokeObjectURL(this.#videoObjectUrl);
      this.#videoObjectUrl = null;
    }

    if (file) {
      this.#videoObjectUrl = URL.createObjectURL(file);
      this.videoPreviewUrl.set(this.#videoObjectUrl);
      this.videoDuration.set(0);
    } else {
      this.videoPreviewUrl.set(null);
      this.videoDuration.set(0);
    }
  }

  onVideoMetadataLoaded(event: Event) {
    const element = event.target as HTMLVideoElement | null;
    const duration =
      element && Number.isFinite(element.duration) ? Math.floor(element.duration) : 0;
    this.videoDuration.set(duration);

    this.videoAssignmentFormModel.update((current) => {
      if (!duration) {
        return current;
      }

      return {
        ...current,
        startTime: 0,
        endTime: duration,
      };
    });
  }

  onStartTimeInput(value: string | number) {
    const startTime = Number(value) || 0;
    this.videoAssignmentFormModel.update((current) => ({
      ...current,
      startTime,
      endTime: Math.max(current.endTime ?? 0, startTime),
    }));

    const video = this.videoElement()?.nativeElement;
    if (video && Number.isFinite(video.duration)) {
      video.currentTime = Math.min(Math.max(0, startTime), video.duration);
    }
  }

  onEndTimeInput(value: string | number) {
    const endTime = Number(value) || 0;
    this.videoAssignmentFormModel.update((current) => ({
      ...current,
      startTime: Math.min(current.startTime ?? 0, endTime),
      endTime,
    }));
  }

  onPreviewTimeUpdate() {
    const video = this.videoElement()?.nativeElement;
    if (!video || !Number.isFinite(video.duration)) {
      return;
    }

    const { startTime, endTime } = this.videoAssignmentFormModel();
    if (endTime > 0 && video.currentTime >= endTime) {
      video.pause();
      video.currentTime = Math.min(Math.max(0, startTime), video.duration);
    }
  }

  handlePlayerSelected(event: MatAutocompleteSelectedEvent) {
    const value = event.option.value;
    this.videoAssignmentFormModel.update((current) => ({
      ...current,
      assignedPlayers: [...current.assignedPlayers, value],
    }));

    setTimeout(() => {
      this.playerInputText.set('');
      this.playerChipInput()?.clear();
      this.playerAutoCompleteTrigger()?.openPanel();
    }, 0);
  }

  removePlayer(playerId: string) {
    this.videoAssignmentFormModel.update((current) => ({
      ...current,
      assignedPlayers: current.assignedPlayers.filter((p) => p.id !== playerId),
    }));
  }

  handleCoachSelected(event: MatAutocompleteSelectedEvent) {
    const value = event.option.value;
    this.videoAssignmentFormModel.update((current) => ({
      ...current,
      managingCoaches: [...current.managingCoaches, value],
    }));

    setTimeout(() => {
      this.coachInputText.set('');
      this.coachChipInput()?.clear();
    }, 0);
  }

  removeCoach(coachId: string) {
    this.videoAssignmentFormModel.update((current) => ({
      ...current,
      managingCoaches: current.managingCoaches.filter((c) => c.id !== coachId),
    }));
  }

  addChoice() {
    this.videoAssignmentFormModel.update((current) => ({
      ...current,
      quizQuestion: {
        ...current.quizQuestion,
        choices: [
          ...current.quizQuestion.choices,
          { choiceText: '', isCorrect: false } as QuizQuestionChoice,
        ],
      },
    }));
  }

  removeChoice(index: number) {
    this.videoAssignmentFormModel.update((current) => {
      if (current.quizQuestion.choices.length <= 1) {
        return current;
      }

      return {
        ...current,
        quizQuestion: {
          ...current.quizQuestion,
          choices: current.quizQuestion.choices.filter((_, choiceIndex) => choiceIndex !== index),
        },
      };
    });
  }

  enforceSingleCorrect(index: number) {
    this.videoAssignmentFormModel.update((current) => {
      const choices = current.quizQuestion.choices.map((choice, choiceIndex) =>
        choiceIndex === index ? choice : { ...choice, isCorrect: false }
      );
      const hasCorrect = choices.some((choice) => choice.isCorrect);

      if (!hasCorrect && choices[index]) {
        choices[index] = { ...choices[index], isCorrect: true };
      }

      return {
        ...current,
        quizQuestion: {
          ...current.quizQuestion,
          choices,
        },
      };
    });
  }

  submit() {
    const request = {
      ...this.videoAssignmentFormModel(),
      assignedPlayers: this.videoAssignmentFormModel().assignedPlayers.map((p) => p.id),
      managingCoaches: this.videoAssignmentFormModel().managingCoaches.map((c) => c.id),
    };

    this.#videoAssignmentStore.createVideoAssignment(request);
  }

  private videoAssignmentToEntry(videoAssignment: VideoAssignment): VideoAssignmentEntry {
    const coaches = this.#data.coaches.filter((coach) =>
      videoAssignment.managingCoaches.includes(coach.id)
    );
    const players = this.#data.players.filter((player) =>
      videoAssignment.assignedPlayers.includes(player.id)
    );

    return {
      managingCoaches: coaches,
      title: videoAssignment.title,
      file: '',
      startTime: videoAssignment.startTime,
      endTime: videoAssignment.endTime,
      description: videoAssignment.description,
      quizQuestion: videoAssignment.quizQuestion,
      assignedPlayers: players,
    };
  }
}
