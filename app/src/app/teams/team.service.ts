import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { getWpConfig } from "../shared/wp-config";

export interface Team {
  id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class TeamService {
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

  getTeams(): Observable<Team[]> {
    return this.#http.get<Team[]>(`${this.wpConfig.restUrl}/mht-dashboard/v1/teams`, {
      headers: this.headers,
      withCredentials: true,
    });
  }
}
