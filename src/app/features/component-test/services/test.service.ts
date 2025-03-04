import { Injectable } from '@angular/core';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TestService {
  constructor() {}

  getList() {
    return of([1, 2, 3, 4]);
  }
}
