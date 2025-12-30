import { NgClass } from '@angular/common';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { VideoAssignmentStore } from '../../video-assignments/video-assignment.store';
import { VideoAssignment } from '../../video-assignments/video-assignment';
import { PlayerAssignment } from '../player';

@Component({
  selector: 'app-player-list',
  imports: [
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    NgClass,
  ],
  templateUrl: './player-list.html',
  styleUrl: './player-list.scss',
})
export class PlayerList {
  #videoAssignmentStore = inject(VideoAssignmentStore);

  paginator = viewChild(MatPaginator);
  sort = viewChild(MatSort);
  displayedColumns = ['playerName', 'videosCompleted', 'correctPercent', 'expand'];
  answerColumns = ['title', 'question', 'answer', 'result', 'submittedAt'];
  expandedElement = signal<PlayerAssignment | null>(null);
  isExpanded = computed(() => this.expandedElement());

  filterText = signal('');

  videoAssignments = this.#videoAssignmentStore.videoAssignments;
  isLoading = this.#videoAssignmentStore.isLoading;
  error = this.#videoAssignmentStore.error;

  playerAssignments = computed(() => {
    const videoAssignments = this.videoAssignments();
    if (!videoAssignments) {
      return [];
    }

    return this.mapPlayersFromVideos(videoAssignments);
  });

  filteredPlayerAssignments = computed(() => {
    const filter = this.filterText().toLowerCase();
    const playerAssignments = this.playerAssignments();
    if (!playerAssignments) {
      return [];
    }

    return playerAssignments.filter((playerAssignment) =>
      playerAssignment.playerName.toLowerCase().includes(filter)
    );
  });

  dataSource = computed(() => {
    const assignments = new MatTableDataSource(this.filteredPlayerAssignments());
    assignments.sort = this.sort();
    return assignments;
  });

  expandedElementDataSource = computed(() => {
    const expandedElement = this.expandedElement();
    if (!expandedElement) {
      return [];
    }

    return new MatTableDataSource(expandedElement.details);
  });

  mapPlayersFromVideos(videos: VideoAssignment[]): PlayerAssignment[] {
    const players = new Map<
      string,
      PlayerAssignment & {
        answered: number;
        correct: number;
      }
    >();

    for (const video of videos) {
      for (const row of video.details) {
        if (!players.has(row.playerId)) {
          players.set(row.playerId, {
            playerId: row.playerId,
            playerName: row.playerName,
            videosAssigned: 0,
            videosCompleted: 0,
            correctPercent: 0,
            answered: 0,
            correct: 0,
            details: [],
          });
        }

        const player = players.get(row.playerId)!;

        player.videosAssigned++;

        const answered = row.answer !== null;

        if (answered) {
          player.answered++;
          if (row.isCorrect) {
            player.correct++;
          }
        }

        // If video has only 1 question, answered === completed
        if (answered) {
          player.videosCompleted++;
        }

        player.details.push({
          videoId: video.id,
          videoTitle: video.title,
          question: row.question,
          answer: row.answer,
          isCorrect: row.isCorrect,
          submittedAt: row.submittedAt,
        });
      }
    }

    return Array.from(players.values()).map((p) => ({
      ...p,
      correctPercent: p.answered > 0 ? Math.round((p.correct / p.answered) * 100) : null,
    }));
  }

  toggleRow(row: any) {
    this.expandedElement.update((current) => (current === row ? null : row));
  }
}
