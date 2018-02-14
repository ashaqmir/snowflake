import { AppStateServiceProvider } from './../app-state-service/app-state-service';
import { Injectable } from "@angular/core";
import { AngularFireList, AngularFireDatabase } from "angularfire2/database";
import { IOrder } from "../../models/models";
import { Observable } from "rxjs/Observable";

@Injectable()
export class OrderServiceProvider {
  basePath: string;
  orderRef: AngularFireList<IOrder>;

  private appState: any;
  constructor(private afDb: AngularFireDatabase,
    appState: AppStateServiceProvider) {
    this.appState = appState;
    this.createBaseRef();
  }

  getUserOrders(uid: string): Observable<IOrder[]> {
    this.createBaseRef();
    return this.orderRef.snapshotChanges().map(arr => {
      return arr.map(snap =>
        Object.assign(snap.payload.val(), { $key: snap.key })
      );
    });
  }

  getUserOrder(key: string): Observable<IOrder | null> {
    const orderPath = `${this.basePath}/${key}`;
    const order = this.afDb
      .object(orderPath)
      .valueChanges() as Observable<IOrder | null>;
    return order;
  }

  createOrder(order: IOrder): PromiseLike<any> {
    this.createBaseRef();
    return this.orderRef.push(order).then(ordr => {
      if (ordr) {
        return ordr;
      }
    });
  }

  createBaseRef() {
    if (!this.basePath) {
      if (this.appState && this.appState.userProfile && this.appState.userProfile.$key) {
        this.basePath = `/Orders/${this.appState.userProfile.$key}`;
        if (this.basePath) {
          console.log('Creating base reference for order.')
          this.orderRef = this.afDb.list(this.basePath);
        }
      }
    }
  }
}
