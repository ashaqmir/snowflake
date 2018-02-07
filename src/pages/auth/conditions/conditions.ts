import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';


@IonicPage()
@Component({
  selector: 'page-conditions',
  templateUrl: 'conditions.html',
})
export class ConditionsPage {

  constructor(public navCtrl: NavController, 
    public navParams: NavParams,
    public viewCtrl: ViewController) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ConsumerConditionsPage');
  }

  accept(){
    let data = { 'condition': 'accept' };
    this.viewCtrl.dismiss(data);
  }

  reject(){
    let data = { 'condition': 'reject' };
    this.viewCtrl.dismiss(data);
  }
}
