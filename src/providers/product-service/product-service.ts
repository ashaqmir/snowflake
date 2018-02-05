import { Injectable } from '@angular/core';
import { AngularFireList, AngularFireDatabase } from 'angularfire2/database';
import { IProduct } from '../../models/product';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class ProductServiceProvider {

  private basePath = '/Products';

  prodductsRef: AngularFireList<IProduct>;

  constructor(private afDb: AngularFireDatabase) {
    this.prodductsRef = afDb.list(this.basePath);
  }

  getProductsList(): Observable<IProduct[]> {
    return this.prodductsRef.snapshotChanges().map((arr) => {
      return arr.map((snap) => Object.assign(snap.payload.val(), { $key: snap.key }));
    });
  }

  // Return a single observable item
  getProduct(key: string): Observable<IProduct | null> {
    const productPath = `${this.basePath}/${key}`;
    const product = this.afDb.object(productPath).valueChanges() as Observable<IProduct | null>;
    return product;
  }


}
