import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { getWpConfig } from '../shared/wp-config';
import { CoachInvite } from '../coach-invites/coach-invite';

@Injectable({ providedIn: 'root' })
export class DashboardService {
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

  getCoachInvites(): Observable<CoachInvite[]> {
    return this.#http.get<CoachInvite[]>(`${this.wpConfig.restUrl}/coach-invites`, {
      headers: this.headers,
      withCredentials: true,
    });
  }
}
