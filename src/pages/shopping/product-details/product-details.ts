import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { IProduct } from '../../../models/product';


@IonicPage()
@Component({
  selector: 'page-product-details',
  templateUrl: 'product-details.html',
})
export class ProductDetailsPage {

  product: IProduct;
  constructor(public navCtrl: NavController,
     public navParams: NavParams) {
  }

  ngOnInit() {
    this.product = this.navParams.get('selectedProduct');
    if (!this.product) {
      this.navCtrl.setRoot('ProductListPage');
    }
    console.log(this.product);
  }

  addToCart() {
    console.log('Add to cart.');
    this.navCtrl.push('CartPage', { selectedProduct: this.product });
  }
}
