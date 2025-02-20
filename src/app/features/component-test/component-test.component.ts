import { AsyncPipe } from '@angular/common';
import { Component } from '@angular/core';
import { combineLatest, map, merge, shareReplay, Subject } from 'rxjs';

@Component({
  selector: 'component-test',
  imports: [AsyncPipe],
  templateUrl: './component-test.component.html',
  styleUrl: './component-test.component.scss',
})
export class ComponentTestComponent {
  //#region A
  a = new Subject<string>();
  a$ = this.a.pipe(shareReplay({ bufferSize: 1, refCount: true }));
  //#endregion A

  //#region B
  b = new Subject<string>();
  b$ = this.b.pipe(shareReplay({ bufferSize: 1, refCount: true }));
  //#endregion B

  //#region C
  c = new Subject<string>();
  c$ = this.c.pipe(shareReplay({ bufferSize: 1, refCount: true }));
  //#endregion C

  //#region D
  d = new Subject<string>();
  d$ = this.d.pipe(shareReplay({ bufferSize: 1, refCount: true }));
  //#endregion D

  //#region MERGE VALUES
  merged$ = merge(this.a$, this.b$, this.c$, this.d$).pipe(
    shareReplay({ bufferSize: 1, refCount: true })
  );
  //#endregion MERGE VALUES

  //#region COMBINED LATEST
  combinedLatest$ = combineLatest([this.a$, this.b$, this.c$, this.d$]).pipe(
    map(([a, b, c, d]) => `${a} - ${b} - ${c} - ${d}`),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  //#endregion COMBINED LATEST
}
