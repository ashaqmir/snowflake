import { AppStateServiceProvider } from "./../app-state-service/app-state-service";
import { Injectable } from "@angular/core";
import { AngularFireList, AngularFireDatabase } from "angularfire2/database";
import * as firebase from "firebase";
import { IOrder } from "../../models/models";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/take";
import "rxjs/add/operator/do";

@Injectable()
export class OrderServiceProvider {
  basePath = "/Orders/";
  orderRef: AngularFireList<IOrder>;

  private appState: any;
  constructor(
    private afDb: AngularFireDatabase,
    appState: AppStateServiceProvider
  ) {
    this.appState = appState;
    this.orderRef = afDb.list(this.basePath);
  }

  getUserOrders(uid: string): Observable<IOrder[]> {
    //this.createBaseRef();
    return this.afDb
      .list(this.basePath, ref => ref.orderByChild("customerId").equalTo(uid))
      .snapshotChanges()
      .map(arr => {
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
    //this.createBaseRef();

    let timestamp = firebase.database.ServerValue.TIMESTAMP;
    order.createdAt = timestamp;
    return this.orderRef.push(order).then(ordr => {
      if (ordr) {
        const key = ordr.key;
        if (key) {
          this.updateTimeStamp(key);
        }
        return ordr;
      }
    });
  }
  updateTimeStamp(key) {
    const orders = this.afDb
      .object(this.basePath + key)
      .valueChanges() as Observable<IOrder | null>;

    if (orders) {
      orders
        .take(1)
        .do(ordr => {
          console.log(`Last Time: ${ordr.createdAt}`);
          const timestamp = ordr.createdAt * -1;
          this.afDb.list(this.basePath).update(key, { createdAt: timestamp });
        })
        .subscribe();
    }
  }
}
