import { computed, inject, Injectable, resource } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { TeamService } from "./team.service";

@Injectable({
  providedIn: 'root',
})
export class TeamStore {
  #teamService = inject(TeamService);

  teamsResource = resource({
    loader: () => firstValueFrom(this.#teamService.getTeams()),
  });

  teams = computed(() => this.teamsResource.value() ?? []);
}
