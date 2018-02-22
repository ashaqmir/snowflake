import { Component, Injector } from "@angular/core";
import { IonicPage, NavController, NavParams } from "ionic-angular";
import { isAuthorized } from "../../../decorators/isAuthorized";

@isAuthorized
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
  payOption: string;
  userMessage: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public injector: Injector
  ) {}

  ionViewDidLoad() {
    this.order = this.navParams.get("finalOrder");
    this.userLastName = this.navParams.get("userLastName");
    this.payOption = this.navParams.get("payOption");

    console.log(`Pay Option: ${this.payOption}`);
    console.log(this.order);

    if (this.order) {
      this.orderShippingAddress = this.order.shippingAddress;
      this.loadView = true;
    }

    if (this.payOption) {
      const msgObj = this.orderMessages[this.payOption];
      if (msgObj) {
        this.userMessage = msgObj[0];
      }
      console.log(this.userMessage.message);
    }
  }

  goHome() {
    this.navCtrl.setRoot("ProductListPage");
  }

  orderMessages = {
    bacs: [
      {
        message:
          " <p>Thank you. Snowflake will make sure that your trip becomes a memory to cherish for.</p><p>Your order will not be confirmed untill payment is recieved. We will contact you shortly.</p><p><strong>Snoflake Tours</strong></p>"
      }
    ],
    poa: [
      {
        message:
          " <p>Thank you. Snowflake will make sure that your trip becomes a memory to cherish for.</p><p>Your order will not be confirmed untill payment is recieved. We will contact you shortly.</p><p><strong>Snoflake Tours</strong></p>"
      }
    ],
    razor: [
      {
        message:
          " <p>Thank you. Snowflake will make sure that your trip becomes a memory to cherish for.</p><p>Your order will be confirmed shortly.</p><p><strong>Snoflake Tours</strong></p>"
      }
    ]
  };
}
