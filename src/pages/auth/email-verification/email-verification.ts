import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import * as firebase from 'firebase';
@IonicPage()
@Component({
  selector: 'page-email-verification',
  templateUrl: 'email-verification.html',
})
export class EmailVerificationPage {

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private toast: ToastController, ) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad EmailVerificationPage');
  }

  resendVerificationEmail() {
    let user: any = firebase.auth().currentUser;
    user.sendEmailVerification().then(
      (success) => {
        //Show toast and redirect to login
        this.toast.create({
          message: 'Verification mail sent, Please verify your email',
          duration: 4000
        }).present();
        this.navCtrl.setRoot('LoginPage');
        console.log("please verify your email")
      }).catch((err) => {
        console.log(err)
      });
  }
}
