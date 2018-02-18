import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";

@IonicPage()
@Component({
  selector: "page-order-final",
  templateUrl: "order-final.html"
})
export class OrderFinalPage {
  order: any;
  userLastName: string;
  orderShippingAddress: any;
  loadView: boolean = false;
  constructor(public navCtrl: NavController, public navParams: NavParams) {}

  ionViewDidLoad() {
    this.order = this.navParams.get("finalOrder");
    this.userLastName = this.navParams.get("userLastName");

    if (this.order) {
      this.orderShippingAddress = this.order.shippingAddress;
      this.loadView = true;
    }
  }

  goHome() {
    this.navCtrl.setRoot("ProductListPage");
  }
}
