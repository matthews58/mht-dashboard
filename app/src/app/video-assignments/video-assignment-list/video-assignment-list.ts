import { NgClass } from '@angular/common';
import { Component, computed, inject, signal, viewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { VideoAssignmentStore } from '../video-assignment.store';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { VideoAssignment } from '../video-assignment';
import { MatDialog } from '@angular/material/dialog';
import { VideoAssignmentDialog } from '../video-assignment-dialog/video-assignment-dialog';
import { UserStore } from '../../users/user.store';
import { VideoAssignmentPreviewDialog } from '../video-assignment-preview-dialog/video-assignment-preview-dialog';

@Component({
  selector: 'app-video-assignment-list',
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
  templateUrl: './video-assignment-list.html',
  styleUrl: './video-assignment-list.scss',
})
export class VideoAssignmentList {
  #videoAssignmentStore = inject(VideoAssignmentStore);
  #userStore = inject(UserStore);
  #dialogService = inject(MatDialog);

  paginator = viewChild(MatPaginator);
  sort = viewChild(MatSort);
  displayedColumns = ['title', 'playersResponded', 'correctPercentage', 'createdAt', 'expand', 'actions'];
  answerColumns = ['player', 'question', 'answer', 'result', 'submittedAt'];
  expandedElement = signal<VideoAssignment | null>(null);
  isExpanded = computed(() => this.expandedElement());

  filterText = signal('');

  assignments = this.#videoAssignmentStore.videoAssignments;
  isLoading = this.#videoAssignmentStore.isLoading;
  error = this.#videoAssignmentStore.error;

  filteredVideoAssignments = computed(() => {
    const filter = this.filterText().toLowerCase();
    const assignments = this.assignments();
    if (!assignments) {
      return [];
    }

    return assignments.filter((assignment) => assignment.title.toLowerCase().includes(filter));
  });

  dataSource = computed(() => {
    const assignments = new MatTableDataSource(this.filteredVideoAssignments());
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

  constructor() {
    this.#videoAssignmentStore.load();
  }

  toggleRow(row: any) {
    this.expandedElement.update((current) => (current === row ? null : row));
  }

  openVideoAssignmentDialog(video?: VideoAssignment) {
    const players = this.#userStore.users().filter((user) => user.roles.includes('um_player'));
    const coaches = this.#userStore.users().filter((user) => user.roles.includes('um_coach'));

    this.#dialogService.open(VideoAssignmentDialog, {
      autoFocus: false,
      disableClose: true,
      width: '650px',
      maxWidth: '100vw',
      data: {
        players,
        coaches,
        video
      },
    });
  }

  previewVideo(video: VideoAssignment) {
    this.#dialogService.open(VideoAssignmentPreviewDialog, {
      autoFocus: false,
      disableClose: true,
      height: 'min(100vh, 600px)',
      width: '1000px',
      maxWidth: '100vw',
      data: {
        video,
      },
    });
  }
}
