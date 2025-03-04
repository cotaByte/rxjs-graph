import { AsyncPipe, CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
  combineLatest,
  map,
  merge,
  Observable,
  shareReplay,
  Subject,
} from 'rxjs';

@Component({
  selector: 'component-test',
  imports: [AsyncPipe, CommonModule],
  templateUrl: './component-test.component.html',
  styleUrl: './component-test.component.scss',
})
export class ComponentTestComponent {
  //#region A
  a: Subject<string> = new Subject<string>();
  a$: Observable<string> = this.a.pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );
  //#endregion A

  //#region B
  b: Subject<string> = new Subject<string>();
  b$ = this.b.pipe(shareReplay({ bufferSize: 1, refCount: true }));
  //#endregion B

  //#region C
  c: Subject<string> = new Subject<string>();
  c$: Observable<string> = this.c.pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );
  //#endregion C

  //#region D
  d: Subject<string> = new Subject<string>();
  d$: Observable<string> = this.d.pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );
  //#endregion D

  //#region MERGE VALUES
  merged$: Observable<string> = merge(this.a$, this.b$, this.c$, this.d$).pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );
  //#endregion MERGE VALUES

  //#region COMBINED LATEST
  combinedLatest$: Observable<Record<string, string>> = combineLatest([
    this.a$,
    this.b$,
    this.c$,
    this.d$,
  ]).pipe(
    map(([a, b, c, d]) => ({ a, b, c, d })),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  //#endregion COMBINED LATEST
}
