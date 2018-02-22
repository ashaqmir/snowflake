import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams, Events } from "ionic-angular";
import { IProduct } from "../../../models/product";
import {
  StorageHelperProvider,
  AppStateServiceProvider
} from "../../../providers/providers";

@IonicPage()
@Component({
  selector: "page-product-details",
  templateUrl: "product-details.html"
})
export class ProductDetailsPage {
  product: IProduct;
  private appState: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public events: Events,
    private storageHelper: StorageHelperProvider,
    appState: AppStateServiceProvider
  ) {
    this.appState = appState;
  }

  ngOnInit() {
    this.product = this.navParams.get("selectedProduct");
    if (!this.product) {
      this.navCtrl.setRoot("ProductListPage");
    }
    console.log(this.product);
  }

  addToCart() {
    console.log("Add to cart.");
    if (this.product) {
      this.storageHelper.setItem("lastCartItem", this.product);
      this.events.publish("cart:itemChanged", this.product);
    }
    console.log('step1');
    if (this.appState.loginState) {
      console.log('step2');
      this.navCtrl.push("CartPage", { selectedProduct: this.product });
    } else {
      this.navCtrl.setRoot("LoginPage");
    }
  }
}
