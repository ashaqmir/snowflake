import { Component, Injector } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { isAuthorized } from "../../decorators/isAuthorized";
import {
  OrderServiceProvider,
  AppStateServiceProvider
} from "../../providers/providers";
import { IOrder } from "../../models/order";
import { Observable } from "rxjs/Observable";

@isAuthorized
@IonicPage()
@Component({
  selector: "page-user-orders",
  templateUrl: "user-orders.html"
})
export class UserOrdersPage {
  private appState: any;
  userOrders: Observable<IOrder[]>;
  hasOrders = false;
  observerRef: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public injector: Injector,
    private ordrService: OrderServiceProvider,
    appState: AppStateServiceProvider
  ) {
    this.appState = appState;
  }

  ionViewWillLoad() {
    console.log("User Packages page");
  }

  ionViewDidLoad() {
    this.appState.currentView = "UserOrdersPage";
    if (this.appState && this.appState.userProfile) {
      this.userOrders = this.ordrService.getUserOrders(
        this.appState.userProfile.$key
      );

      this.observerRef = this.userOrders.subscribe(data => {
        if (data && data.length > 0) {
          this.hasOrders = true;
        } else {
          this.hasOrders = false;
        }
      });
    }
  }
  ionViewDidLeave() {
    this.appState.currentView = "";
    if (this.observerRef) {
      this.observerRef.unsubscribe();
    }
  }
}
