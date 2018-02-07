import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams
} from "ionic-angular";
import { LoadingController } from "ionic-angular/components/loading/loading-controller";
import { Observable } from "rxjs/Observable";
import { IProduct } from "../../../models/product";
import { ProductServiceProvider } from "../../../providers/provider";

@IonicPage()
@Component({
  selector: "page-product-list",
  templateUrl: "product-list.html"
})
export class ProductListPage {
  products: Observable<IProduct[]>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    private prodSvc: ProductServiceProvider
  ) {}

  ngOnInit() {
    let loadingPopup = this.loadingCtrl.create({
      spinner: "crescent",
      content: ""
    });
    loadingPopup.present();

    this.products = this.prodSvc.getProductsList();

    loadingPopup.dismiss();
  }

  productDetails(product) {
    if (product) {
      if (product.$key) {
        console.log(product);
        this.navCtrl.push("ProductDetailsPage", { selectedProduct: product });
      }
    }
  }
}
