import { computed, inject, Injectable, resource } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { UserService } from "./user.service";

@Injectable({
  providedIn: 'root',
})
export class UserStore {
  #userService = inject(UserService);

  usersResource = resource({
    loader: () => firstValueFrom(this.#userService.getUsers()),
  });

  users = computed(() => (this.usersResource.value() ?? []));
}
