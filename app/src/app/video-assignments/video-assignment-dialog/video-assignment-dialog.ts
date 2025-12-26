import { Component, effect, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Field, form } from '@angular/forms/signals';
import { VideoAssignmentEntry, initialData, videoAssignmentSchema } from '../video-assignment';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-video-assignment-dialog',
  imports: [
    MatDialogModule,
    MatInputModule,
    Field,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './video-assignment-dialog.html',
  styleUrl: './video-assignment-dialog.scss',
})
export class VideoAssignmentDialog {
  videoAssignmentModel = signal<VideoAssignmentEntry>(initialData);
  videoAssignmentForm = form(this.videoAssignmentModel, videoAssignmentSchema);

  eff = effect(() => console.log('title', this.videoAssignmentModel().title));

  videoSelected(event: any) {
    console.log(event);
  }
  
  submit() {}
}
