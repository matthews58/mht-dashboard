import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { Observable } from "rxjs";
import { getWpConfig } from "../shared/wp-config";

export interface User {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class UserService {
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

  getUsers(): Observable<User[]> {
    return this.#http.get<User[]>(`${this.wpConfig.restUrl}/mht-dashboard/v1/users`, {
      headers: this.headers,
      withCredentials: true,
    });
  }
}
