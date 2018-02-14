import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { isAuthorized } from '../../decorators/isAuthorized';



@isAuthorized
@IonicPage()
@Component({
  selector: 'page-user-orders',
  templateUrl: 'user-orders.html',
})
export class UserOrdersPage {

  constructor(public navCtrl: NavController, public navParams: NavParams) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UserOrdersPage');
  }

}
