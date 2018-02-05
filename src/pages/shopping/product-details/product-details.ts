import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, PopoverController } from 'ionic-angular';
import { IProduct } from '../../../models/product';


@IonicPage()
@Component({
  selector: 'page-product-details',
  templateUrl: 'product-details.html',
})
export class ProductDetailsPage {

  product: IProduct;
  constructor(public navCtrl: NavController,
     public navParams: NavParams,
     private popoverCtrl: PopoverController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ProductDetailsPage');
    
  }

  ngOnInit() {
    this.product = this.navParams.get('selectedProduct');
    if (!this.product) {
      this.navCtrl.setRoot('ProductListPage');
    }
    console.log(this.product);
  }

  presentPopover(event) {
    let popover = this.popoverCtrl.create('UserOptionsPage')
    popover.present({
      ev: event
    });
  }
}
