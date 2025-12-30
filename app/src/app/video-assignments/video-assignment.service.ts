import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { getWpConfig } from '../shared/wp-config';
import { VideoAssignmentRequest, VideoAssignmentsResponse } from './video-assignment';
import { switchMap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class VideoAssignmentService {
  #http = inject(HttpClient);

  private wpConfig = getWpConfig();

  private get jsonHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.wpConfig.nonce) {
      headers['X-WP-Nonce'] = this.wpConfig.nonce;
    }

    return new HttpHeaders(headers);
  }

  private get uploadHeaders() {
    const headers: Record<string, string> = {};

    if (this.wpConfig.nonce) {
      headers['X-WP-Nonce'] = this.wpConfig.nonce;
    }

    return new HttpHeaders(headers);
  }

  getVideoAssignments() {
    return this.#http.get<VideoAssignmentsResponse>(
      `${this.wpConfig.restUrl}/mht-dashboard/v1/video-assignments`,
      {
        headers: this.jsonHeaders,
        withCredentials: true,
      }
    );
  }

  createVideoAssignment(request: VideoAssignmentRequest) {
    return this.uploadVideo(request.file).pipe(
      switchMap((uploadResponse) =>
        this.#http.post<any>(
          `${this.wpConfig.restUrl}/coach-tools/v1/create-video-assignment`,
          {
            ...request,
            videoFile: uploadResponse.attachmentId
          },
          {
            headers: this.jsonHeaders,
            withCredentials: true,
          }
        )
      )
    );
  }

  private uploadVideo(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.#http.post<{ attachmentId: number }>(
      `${this.wpConfig.restUrl}/coach-tools/v1/upload-video`,
      formData,
      {
        headers: this.uploadHeaders,
        withCredentials: true,
      }
    );
  }
}
