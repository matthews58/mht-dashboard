import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { getWpConfig } from '../shared/wp-config';
import { CoachInvite, SendCoachInviteRequest, SendCoachInviteResponse } from './coach-invite';

@Injectable({ providedIn: 'root' })
export class CoachInviteService {
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

  getCoachInvites() {
    return this.#http.get<CoachInvite[]>(`${this.wpConfig.restUrl}/mht-dashboard/v1/coach-invites`, {
      headers: this.headers,
      withCredentials: true,
    });
  }

  sendCoachInvites(request: SendCoachInviteRequest) {
    return this.#http.post<SendCoachInviteResponse[]>(`${this.wpConfig.restUrl}/coach-tools/v1/send-invites`, request, {
      headers: this.headers,
      withCredentials: true,
    });
  }
}
