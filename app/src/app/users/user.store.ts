import { computed, inject, Injectable, resource } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { UserService } from "./user.service";

@Injectable({
  providedIn: 'root',
})
export class UserStore {
  #userService = inject(UserService);

  userResource = resource({
    loader: () => firstValueFrom(this.#userService.getUser()),
  });

  user = computed(() => (this.userResource.hasValue() ? this.userResource.value() : null));
}
