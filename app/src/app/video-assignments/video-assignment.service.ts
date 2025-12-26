import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { getWpConfig } from '../shared/wp-config';
import { VideoAssignmentsResponse } from './video-assignment';

@Injectable({ providedIn: 'root' })
export class VideoAssignmentService {
  #http = inject(HttpClient);

  private wpConfig = getWpConfig();

  private get headers() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.wpConfig.nonce) {
      headers['X-WP-Nonce'] = this.wpConfig.nonce;
    }

    return new HttpHeaders(headers);
  }

  getVideoAssignments() {
    return this.#http.get<VideoAssignmentsResponse>(`${this.wpConfig.restUrl}/mht-dashboard/v1/video-assignments`, {
      headers: this.headers,
      withCredentials: true,
    });
  }

}
