import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject, Observable, Subject, combineLatest, of } from 'rxjs';
import { filter, map, switchMap } from 'rxjs/operators';
import { ProductModel } from '../../models/product.model';
import { ProductsService } from '../../services/products.service';

@Component({
  selector: 'app-product-list',
  styleUrls: ['./product-list.component.scss'],
  templateUrl: './product-list.component.html',
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent {
  readonly categories$: Observable<string[]> = this._productsService.getAllCategories();

  private _refreshSubject: BehaviorSubject<void> = new BehaviorSubject<void>(void 0);
  public refresh$: Observable<void> = this._refreshSubject.asObservable();

  private _categorySubject: Subject<string> = new Subject<string>();
  public category$: Observable<string> = this._categorySubject.asObservable();

  public orders: Observable<string[]> = of(['asc', 'desc'])
  private _orderSubject: BehaviorSubject<string> = new BehaviorSubject<string>('asc');
  public order$: Observable<string> = this._orderSubject.asObservable();

  readonly products$: Observable<ProductModel[]> = combineLatest([
    this.refresh$.pipe(switchMap(data => this._productsService.getAll())),
    this.category$,
    this.order$
  ]).pipe(map(([products, category, order]: [ProductModel[], string, string]) => {
    return products.filter(data => data.category === category).sort((a, b) => {
      if (a.price > b.price) return order=='asc'? 1:-1;
      if (a.price < b.price) return order=='asc'? -1:1;
      else return 0;
    });

  }));


  constructor(private _productsService: ProductsService) {
  }

  deleteProduct(id: string): void {
    this._productsService.deleteProduct(id).subscribe(() => {
      this._refreshSubject.next(void 0)
    });

  }

  changeCategory(category: string): void {
    this._categorySubject.next(category);
    console.log('category changed: ' + category)
  }

  changeOrder(order:string): void {
    this._orderSubject.next(order)
  }
}
