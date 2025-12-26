import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SnackbarService {
  #snackbar = inject(MatSnackBar);

  success(message: string) {
    this.#snackbar.open(message, '', {
      duration: 5000,
      panelClass: 'snackbar--primary',
    });
  }

  successWithAction(message: string, buttonText: string, callback: Function) {
    const snackBarRef = this.#snackbar.open(message, buttonText, {
      duration: 5000,
      panelClass: 'snackbar--primary',
    });

    let snackBarSub: Subscription;
    snackBarSub = snackBarRef.onAction().subscribe(() => {
      callback();
      snackBarSub.unsubscribe();
    });
  }

  error(message: string) {
    const snackBarRef = this.#snackbar.open(message, 'Close', {
      panelClass: 'snackbar--warn',
    });

    snackBarRef.onAction().subscribe(() => snackBarRef.dismiss());
  }
}
