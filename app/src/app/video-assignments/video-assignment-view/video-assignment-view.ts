import { Component, computed, effect, input, signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { VideoAssignment } from '../video-assignment';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-video-assignment-view',
  imports: [MatExpansionModule, MatIconModule],
  templateUrl: './video-assignment-view.html',
  styleUrl: './video-assignment-view.scss',
})
export class VideoAssignmentView {
  videoAssignment = input.required<VideoAssignment>();

  quizActive = signal(false);
  selectedChoiceIndex = signal<number | null>(null);

  isSelectedChoiceCorrect = computed(() => {
    const assignment = this.videoAssignment();
    const selectedChoiceIndex = this.selectedChoiceIndex();
    if (!selectedChoiceIndex) {
      return;
    }

    const choice = assignment.quizQuestion.choices[selectedChoiceIndex];
    return choice?.isCorrect;
  });

  private readonly timeEpsilon = 0.2;
  private hasPausedForQuiz = false;
  private isSettingTime = false;

  resetStateEffect = effect(() => {
    this.videoAssignment();
    this.quizActive.set(false);
    this.selectedChoiceIndex.set(null);
    this.hasPausedForQuiz = false;
  });

  onLoadedMetadata(video: HTMLVideoElement) {
    const assignment = this.videoAssignment();
    this.resetVideoState(video, assignment);
  }

  onTimeUpdate(video: HTMLVideoElement) {
    const assignment = this.videoAssignment();
    this.checkQuizPause(video, assignment);
    this.enforceBounds(video, assignment);
  }

  onSeeking(video: HTMLVideoElement) {
    this.enforceBounds(video, this.videoAssignment());
  }

  onPlay(video: HTMLVideoElement) {
    this.enforceBounds(video, this.videoAssignment());
  }

  private resetVideoState(video: HTMLVideoElement, assignment: VideoAssignment) {
    this.hasPausedForQuiz = false;
    this.quizActive.set(false);
    this.selectedChoiceIndex.set(null);
    this.seekToStart(video, assignment);
  }

  private seekToStart(video: HTMLVideoElement, assignment: VideoAssignment) {
    const startTime = this.getStartTime(assignment);
    this.setTime(video, startTime);
  }

  private enforceBounds(video: HTMLVideoElement, assignment: VideoAssignment) {
    if (this.isSettingTime) {
      return;
    }

    const startTime = this.getStartTime(assignment);
    const endTime = this.getEndTime(assignment);

    if (video.currentTime < startTime - this.timeEpsilon) {
      this.setTime(video, startTime);
      return;
    }

    if (endTime !== null && video.currentTime > endTime - this.timeEpsilon) {
      this.setTime(video, endTime);
      video.pause();
    }
  }

  private checkQuizPause(video: HTMLVideoElement, assignment: VideoAssignment) {
    if (this.hasPausedForQuiz || this.isSettingTime) {
      return;
    }

    const pauseTime = this.getPauseTime(assignment);
    if (pauseTime === null) {
      return;
    }

    if (video.currentTime + 0.05 >= pauseTime - this.timeEpsilon) {
      this.hasPausedForQuiz = true;
      this.quizActive.set(true);
      video.pause();
      this.setTime(video, pauseTime);
    }
  }

  private getStartTime(assignment: VideoAssignment) {
    const startTime = this.toNumber(assignment.startTime);
    return startTime ?? 0;
  }

  private getEndTime(assignment: VideoAssignment) {
    return this.toNumber(assignment.endTime);
  }

  private getPauseTime(assignment: VideoAssignment) {
    const pauseTime = this.toNumber(assignment.quizQuestion?.pauseTime);
    if (pauseTime === null) {
      return null;
    }

    const startTime = this.getStartTime(assignment);
    const endTime = this.getEndTime(assignment);
    if (pauseTime < startTime - this.timeEpsilon) {
      return null;
    }
    if (endTime !== null && pauseTime > endTime + this.timeEpsilon) {
      return null;
    }
    return pauseTime;
  }

  private toNumber(value: unknown) {
    if (value === null || value === undefined || value === '') {
      return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private setTime(video: HTMLVideoElement, time: number) {
    this.isSettingTime = true;
    video.currentTime = time;
    queueMicrotask(() => {
      this.isSettingTime = false;
    });
  }
}
