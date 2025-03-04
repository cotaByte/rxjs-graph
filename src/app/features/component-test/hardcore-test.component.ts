import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { ConnectedPosition } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  QueryList,
  ViewChild,
} from '@angular/core';

import {
  combineLatest,
  defer,
  filter,
  first,
  from,
  map,
  merge,
  mergeWith,
  Observable,
  of,
  ReplaySubject,
  shareReplay,
  startWith,
  Subject,
  switchMap,
  take,
  tap,
  withLatestFrom,
} from 'rxjs';
import { TestService } from 'src/app/features/component-test/services/test.service';

type ImpMenuV3Items = {
  left: ImpMenuV3ItemComponent[];
  right: ImpMenuV3ItemComponent[];
  toolbar: ImpMenuV3ItemComponent[];
};

type ImpMenuV3ItemComponent = {
  id: string;
  position: ImpMenuV3Position;
  fixed: boolean;
  width$: Observable<number>;
  visible: boolean;
  visibleSetter: boolean;
};

type ImpResizeEvent = {
  DOMRect: DOMRect;
};

enum ImpMenuV3Positions {
  left = 'left',
  right = 'right',
  toolbar = 'toolbar',
}

type ImpMenuV3Position = 'left' | 'right' | 'toolbar';

@Component({
  selector: 'hardcore-component',
  template: '<br>',
  animations: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class hardCoreComponentTestComponent {
  @HostBinding('class')

  //#region VIEWCHILD
  @ViewChild('collapsedLeftItemsButton')
  collapsedLeftItemsButton!: ElementRef<HTMLDivElement>;
  @ViewChild('collapsedRightItemsButton')
  collapsedRightItemsButton!: ElementRef<HTMLDivElement>;
  //#endregion VIEWCHILD

  //#region TRANSLATIONS
  public readonly TRANSLATIONS = 'TRADUCCIONES';
  //#endregion TRANSLATIONS

  //#region INPUTS
  @Input()
  editable: boolean = true;
  @Input()
  allowToolbar: boolean = true;
  @Input('storageKey')
  set storageKeySetter(v: string) {
    if (!v) return;
    this.storageKey.next(v ?? '');
  }
  public storageKey = new ReplaySubject<string>(1);
  //#endregion INPUTS

  //#region CDK POSITIONS
  public CDK_EDIT_MENU_OVERLAY_POSITION: ConnectedPosition[] = [
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top',
    },
  ];

  public CDK_TOOLBAR_POSITION: ConnectedPosition[] = [
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
    },
  ];

  public CDK_LEFT_COLLAPSED_ITEMS: ConnectedPosition[] = [
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
    },
  ];

  public CDK_RIGHT_COLLAPSED_ITEMS: ConnectedPosition[] = [
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top',
    },
  ];
  //#endregion CDK POSITIONS

  //#region RAW ITEMS
  @ContentChildren('item', { descendants: true })
  set rawItemsSetter(v: QueryList<ImpMenuV3ItemComponent>) {
    this.rawItems.next(v);
  }
  private rawItems = new ReplaySubject<QueryList<ImpMenuV3ItemComponent>>(1);
  public rawItems$ = this.rawItems.pipe(
    first(),
    switchMap((rawItems) =>
      rawItems.changes.pipe(
        map(() => rawItems.toArray()),
        startWith(rawItems.toArray())
      )
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  //#endregion RAW ITEMS

  //#region ACTIONS
  public actions$ = this.rawItems.pipe(
    first(),
    switchMap((rawItems) =>
      rawItems.changes.pipe(
        take(1),
        map(() => rawItems.toArray()),
        startWith(rawItems.toArray()),
        map((items) => items.map(({ id }) => id))
      )
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  //#endregion ACTIONS

  //#region DEFAULT MENU V3 ITEMS
  public readonly DEFAULT_MENU_V3_ITEMS: ImpMenuV3Items = {
    left: [],
    right: [],
    toolbar: [],
  };
  //#endregion DEFAULT MENU V3 ITEMS

  //#region LOCAL STORAGE ITEMS
  // itemsFromStorage$ = this.storageKey.pipe(
  itemsFromStorage$: Observable<ImpMenuV3Items> = this.storageKey.pipe(
    switchMap((key) => {
      const storedItems = localStorage.getItem(`${key}_menu`);
      return storedItems ? of(JSON.parse(storedItems)) : of(null);
    }),
    withLatestFrom(this.rawItems$),
    map(([storedItems, rawItems]) => {
      //note: return empty arrays from storage as a indicator that no items are stored
      if (!storedItems) return this.DEFAULT_MENU_V3_ITEMS;

      //flatten stored items to check item not stored yet
      const allStoredItems = Object.entries(storedItems).reduce(
        (acc, [_, items]) => {
          acc.push(...(items as string[]));
          return acc;
        },
        [] as string[]
      );
      const newItems = rawItems.filter(
        ({ id }) => !allStoredItems.includes(id)
      );

      //add all new items to their respective position
      newItems.forEach(({ position, id }) => {
        storedItems[position].push(id);
      });

      const mapItems = (ids: string[]) =>
        ids
          .map((id) => rawItems.find((item) => item.id === id)!)
          .filter(Boolean);

      return {
        left: mapItems(storedItems.left ?? []),
        right: mapItems(storedItems.right ?? []),
        toolbar: mapItems(storedItems.toolbar ?? []),
      };
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  //#endregion LOCAL STORAGE ITEMS

  //#region ALL ITEMS
  public allItems$: Observable<ImpMenuV3Items> = combineLatest([
    this.actions$,
    this.rawItems$,
  ]).pipe(
    map(([actions, templates]) => {
      const visibles = actions
        .map((action) => templates.find((template) => template.id === action)!)
        .filter(Boolean)
        .sort(this.fixedItemsFirst);

      return {
        left: visibles.filter(
          ({ position }) => position === ImpMenuV3Positions.left
        ),
        right: visibles.filter(
          ({ position }) => position === ImpMenuV3Positions.right
        ),
        toolbar: visibles.filter(
          ({ position }) => position === ImpMenuV3Positions.toolbar
        ),
      };
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  //#endregion ALL ITEMS

  //#region ITEMS
  items$: Observable<ImpMenuV3Items> = merge(
    defer(() => this.onDropItem$),
    defer(() => this.defaultMenuConfig$),
    combineLatest([this.allItems$, this.itemsFromStorage$]).pipe(
      map(([allItems, itemsFromStorage]) =>
        Object.entries(itemsFromStorage).some(([value]) => value.length > 0)
          ? itemsFromStorage
          : allItems
      )
    )
  ).pipe(
    withLatestFrom(this.storageKey),
    tap(([items, storageKey]) => this.setMenuConfigToLS(storageKey, items)),
    map(([items]) => items),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  //#endregion ITEMS

  //#region DRAG ITEM
  public dropItem = new Subject<CdkDragDrop<ImpMenuV3ItemComponent[]>>();
  public onDropItem$: Observable<ImpMenuV3Items> = this.dropItem.pipe(
    withLatestFrom(this.items$),
    map(([event, items]) => {
      const drapDropListsIds: { [k: string]: ImpMenuV3Position } = {
        leftItemsGroup: 'left',
        rightItemsGroup: 'right',
        toolbarItemsGroup: 'toolbar',
      };

      const sourceList =
        drapDropListsIds[event.previousContainer.element.nativeElement.id];
      const targetList =
        drapDropListsIds[event.container.element.nativeElement.id];
      const item = items[sourceList][event.previousIndex];
      item.position = targetList;

      let sourceFinal = items[sourceList];
      let targetFinal = items[targetList];

      if (sourceList === targetList) {
        sourceFinal = [...sourceFinal];
        sourceFinal.splice(event.previousIndex, 1);
        sourceFinal.splice(event.currentIndex, 0, item);
        targetFinal = sourceFinal;
      } else {
        sourceFinal = items[sourceList].filter(
          (item) =>
            item.id !== event.previousContainer.data[event.previousIndex].id
        );

        targetFinal = [
          ...items[targetList].slice(0, event.currentIndex),
          items[sourceList][event.previousIndex],
          ...items[targetList].slice(event.currentIndex),
        ];
      }

      return {
        ...items,
        [sourceList]: sourceFinal,
        [targetList]: targetFinal,
      };
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  //#endregion DRAG ITEM

  //#region RESET DEFAULT MENU
  public resetDefaultMenu = new Subject<void>();
  public defaultMenuConfig$: Observable<ImpMenuV3Items> =
    this.resetDefaultMenu.pipe(
      tap(() => localStorage.removeItem(`${this.storageKey}_menu`)),
      switchMap(() => this.allItems$.pipe(take(1))),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  //#endregion RESET DEFAULT MENU

  //#region OUTPUTS
  @Output() public itemsChanges = new EventEmitter<ImpMenuV3Items>();
  public itemsChange$ = this.items$.pipe(
    tap((items) => this.itemsChanges.emit(items)),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  //#endregion OUTPUTS

  //#region LEFT CONTAINER WIDTH
  leftContainerWidthChange = new ReplaySubject<ImpResizeEvent>(1);
  leftContainerWidth$ = this.leftContainerWidthChange.pipe(
    map(({ DOMRect }) => DOMRect.width),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  //#endregion LEFT CONTAINER WIDTH

  //#region LEFT ITEMS WIDTH
  leftItemsWidth$ = this.items$.pipe(
    filter((items) => items.left.length > 0),
    map((items) => items.left.map((item) => item.width$)),
    switchMap((widths) => combineLatest(widths)),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  //#endregion LEFT ITEMS WIDTH

  //#region LEFT ITEMS
  leftItems$ = combineLatest([
    this.leftContainerWidth$,
    this.leftItemsWidth$,
  ]).pipe(
    withLatestFrom(this.items$),
    tap(([[containerWidth, itemsWidth], items]) => {
      let elementsWidth = 0;
      const someItemsAreHidden = items.left.some(({ visible }) => !visible);
      const collapsedBtnWidth = someItemsAreHidden
        ? this.collapsedLeftItemsButton.nativeElement.offsetWidth
        : 0;

      //just make the calculation when there are items
      items.left.length &&
        itemsWidth.forEach((width, i) => {
          elementsWidth += width;
          items.left[i].visibleSetter =
            elementsWidth + (someItemsAreHidden ? collapsedBtnWidth : 0) <=
            containerWidth;
        });
    }),
    map(([[_, __], items]) => items.left),
    mergeWith(
      this.testService.getList().pipe(
        withLatestFrom(this.items$.pipe(take(1))),
        map(([_, items]) => items.left)
      )
    ),
    map((items) => ({
      visible: items.filter(({ visible }) => visible) ?? [],
      hidden: items.filter(({ visible }) => !visible) ?? [],
    })),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  //#endregion LEFT ITEMS

  //#region RIGHT CONTAINER WIDTH
  rightContainerWidthChange = new ReplaySubject<ImpResizeEvent>(1);
  rightContainerWidth$: Observable<number> =
    this.rightContainerWidthChange.pipe(
      map(({ DOMRect }) => DOMRect.width),
      shareReplay({ bufferSize: 1, refCount: true })
    );
  //#endregion RIGHT CONTAINER WIDTH

  //#region RIGHT ITEMS WIDTH
  rightItemsWidth$: Observable<number[]> = this.items$.pipe(
    filter((items) => items.right.length > 0),
    map((items) => items.right.map((item) => item.width$)),
    switchMap((widths) => combineLatest(widths)),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  //#endregion RIGHT ITEMS WIDTH

  //#region RIGHT ITEMS
  rightItems$ = combineLatest([
    this.rightContainerWidth$,
    this.rightItemsWidth$,
  ]).pipe(
    withLatestFrom(this.items$),
    tap(([[containerWidth, itemsWidth], items]) => {
      let elementsWidth = 0;
      const someItemsAreHidden = items.right.some(({ visible }) => !visible);
      const collapsedBtnWidth = someItemsAreHidden
        ? this.collapsedRightItemsButton.nativeElement.offsetWidth
        : 0;

      //just make the calculation when there are items
      items.right.length &&
        itemsWidth.forEach((width, i) => {
          elementsWidth += width;
          items.right[i].visibleSetter =
            elementsWidth + (someItemsAreHidden ? collapsedBtnWidth : 0) <=
            containerWidth;
        });
    }),
    map(([[_, __], items]) => items.right),
    mergeWith(
      this.items$.pipe(
        take(1),
        map(({ right }) => right)
      )
    ),
    map((items) => ({
      visible: items.filter(({ visible }) => visible) ?? [],
      hidden: items.filter(({ visible }) => !visible) ?? [],
    })),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  //#endregion RIGHT ITEMS

  constructor(private testService: TestService) {}

  /**
   * Sort function to prioritize fixed items
   * @private
   * @param a
   * @param b
   *
   */
  private fixedItemsFirst = (
    a: ImpMenuV3ItemComponent,
    b: ImpMenuV3ItemComponent
  ) => {
    if (a.fixed && !b.fixed) return -1;
    if (!a.fixed && b.fixed) return 1;
    return 0;
  };

  /**
   * Set menu config to local
   * @private
   * @param storageKey
   * @param items
   */
  private setMenuConfigToLS(storageKey: string, items: ImpMenuV3Items) {
    const ls: any = {};
    Object.entries(items).forEach(([key, value]) => {
      ls[key] = (value as any[]).map(({ id }) => id);
    });
    localStorage.setItem(`${storageKey}_menu`, JSON.stringify(ls));
  }
}
