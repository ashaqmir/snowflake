import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  PopoverController
} from "ionic-angular";
import { ProductServiceProvider } from "../../../providers/product-service/product-service";
import { LoadingController } from "ionic-angular/components/loading/loading-controller";
import { Observable } from "rxjs/Observable";
import { IProduct } from "../../../models/product";

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
    private popoverCtrl: PopoverController,
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

  ionViewDidLoad() {
    console.log("ionViewDidLoad ProductListPage");
  }

  presentPopover(event) {
    console.log("Menu Clicked");
    let popover = this.popoverCtrl.create("UserOptionsPage");
    popover.present({
      ev: event
    });
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
