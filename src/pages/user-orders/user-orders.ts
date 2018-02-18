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
  orders: Observable<IOrder[]>;
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
    if (this.appState && this.appState.userProfile) {
      this.orders = this.ordrService.getUserOrders(
        this.appState.userProfile.$key
      );
    }
  }

  ionViewDidLoad() {
    this.appState.currentView = "UserOrdersPage";
  }
  ionViewDidLeave() {
    this.appState.currentView = "";
  }
}
