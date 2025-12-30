import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { VideoAssignmentView } from "../video-assignment-view/video-assignment-view";
import { VideoAssignment } from '../video-assignment';

@Component({
  selector: 'app-video-assignment-preview-dialog',
  imports: [MatDialogModule, MatIconModule, MatButtonModule, VideoAssignmentView],
  templateUrl: './video-assignment-preview-dialog.html',
  styleUrl: './video-assignment-preview-dialog.scss',
})
export class VideoAssignmentPreviewDialog {
  #data: { video: VideoAssignment } = inject(MAT_DIALOG_DATA);

  videoAssignment = this.#data.video;
}
