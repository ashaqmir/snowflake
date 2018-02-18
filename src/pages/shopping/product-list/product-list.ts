import { Component } from "@angular/core";
import { IonicPage, NavController, NavParams, Events } from "ionic-angular";
import { LoadingController } from "ionic-angular/components/loading/loading-controller";
import { Observable } from "rxjs/Observable";
import { IProduct } from "../../../models/product";
import {
  ProductServiceProvider,
  StorageHelperProvider,
  AppStateServiceProvider
} from "../../../providers/providers";

@IonicPage()
@Component({
  selector: "page-product-list",
  templateUrl: "product-list.html"
})
export class ProductListPage {
  products: Observable<IProduct[]>;
  lastCartItem: any;
  private appState: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public events: Events,
    private prodSvc: ProductServiceProvider,
    private storageHelper: StorageHelperProvider,
    appState: AppStateServiceProvider
  ) {
    this.appState = appState;
  }

  ngOnInit() {
    let loadingPopup = this.loadingCtrl.create({
      spinner: "crescent",
      content: ""
    });
    loadingPopup.present();

    this.products = this.prodSvc.getProductsList();

    this.events.subscribe("cart:itemChanged", product => {
      if (product) {
        this.lastCartItem = product as IProduct;
      }
    });
    loadingPopup.dismiss();
  }

  ionViewDidLoad() {
    this.storageHelper.getItem("lastCartItem").then(item => {
      console.log(item);
      if (item) {
        this.lastCartItem = item as IProduct;
        console.log(this.lastCartItem);
      }
    });
    this.appState.currentView = "ProductListPage";
  }

  ionViewDidLeave() {
    this.appState.currentView = "";
  }
  productDetails(product) {
    if (product) {
      if (product.$key) {
        console.log(product);
        this.navCtrl.push("ProductDetailsPage", { selectedProduct: product });
      }
    }
  }

  openCartItem() {
    if (this.lastCartItem) {
      console.log(this.lastCartItem);
      this.navCtrl.push("CartPage", { selectedProduct: this.lastCartItem });
    }
  }
}
