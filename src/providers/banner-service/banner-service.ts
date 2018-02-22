import { Injectable } from "@angular/core";
import { IBannerImage } from "../../models/models";
import { AngularFireList, AngularFireDatabase } from "angularfire2/database";
import { Observable } from "rxjs/Observable";

@Injectable()
export class BannerServiceProvider {
  private basePath = "/AppBannerImages";

  bannerRef: AngularFireList<IBannerImage>;
  constructor(private afDb: AngularFireDatabase) {
    this.bannerRef = afDb.list(this.basePath);
  }

  getBannerList(): Observable<IBannerImage[]> {
    return this.bannerRef.snapshotChanges().map(arr => {
      return arr.map(snap =>
        Object.assign(snap.payload.val(), { $key: snap.key })
      );
    });
  }

  // Return a single observable item
  getBanner(key: string): Observable<IBannerImage | null> {
    const productPath = `${this.basePath}/${key}`;
    const product = this.afDb
      .object(productPath)
      .valueChanges() as Observable<IBannerImage | null>;
    return product;
  }
}
