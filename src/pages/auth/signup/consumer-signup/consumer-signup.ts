import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, ModalController } from 'ionic-angular';
import { FormGroup, Validators, FormControl, FormBuilder } from '@angular/forms';
import { PasswordValidator } from '../../../../validators/password-validator';


import { LoadingController } from 'ionic-angular/components/loading/loading-controller';
import * as firebase from 'firebase';
import { IProfile } from '../../../../models/profile';
import { AuthServiceProvider } from '../../../../providers/auth-service/auth-service';

@IonicPage()
@Component({
  selector: 'page-consumer-signup',
  templateUrl: 'consumer-signup.html',
})
export class ConsumerSignupPage {
  customerForm: FormGroup;
  matchingPasswordsGroup: FormGroup;
  profile: IProfile;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    private toast: ToastController,
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    public authProvider: AuthServiceProvider) {
  }

  ionViewWillLoad() {
    this.createForms();
  }

  ionViewDidEnter() {
    //this.showingConditions = false;
  }
  onSubmit(values) {
    if (values) {
      let loadingPopup = this.loadingCtrl.create({
        spinner: 'crescent',
        content: ''
      });
      loadingPopup.present();
      let removePop = true;
     
      const email = values.email;
      const password = values.password.password;
      this.authProvider.registerUser(email, password)
        .then(data => {
          this.profile = {} as IProfile;
          this.profile.email = email;
          this.profile.firstName = values.firstName;
          this.profile.lastName = values.lastName;
          this.profile.phone = values.phone;     
          this.profile.isAdmin=false;
          console.log('Registered');
          console.log(data);
          this.authProvider.loginUser(email, password)
            .then(data => {
              this.authProvider.updateUserProfile(this.profile, data.uid).then(data => {
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
                //this.navCtrl.setRoot(ConsumerProfilePage, { profile: this.profile });
                if (removePop) {
                  loadingPopup.dismiss()
                  removePop = false;
                }
                this.navCtrl.setRoot('LoginPage');
              }).catch(error => {
                if (removePop) {
                  loadingPopup.dismiss()
                  removePop = false;
                }
                this.toast.create({
                  message: `profile not saved ${email}`,
                  duration: 3000
                }).present();
                this.navCtrl.setRoot('LoginPage')
              })
            }).catch(error => {
              if (removePop) {
                loadingPopup.dismiss()
                removePop = false;
              }
              this.toast.create({
                message: `login problem ${email}`,
                duration: 3000
              }).present();
              this.navCtrl.setRoot('LoginPage')
            })
        })
        .catch(error => {
          if (removePop) {
            loadingPopup.dismiss()
            removePop = false;
          }
          this.toast.create({
            message: error,
            duration: 3000
          }).present();
        })
    } else {
      this.toast.create({
        message: 'No user data found',
        duration: 3000
      }).present();
    }
  }

  createForms() {
    this.matchingPasswordsGroup = new FormGroup({
      password: new FormControl('', Validators.compose([
        Validators.minLength(5),
        Validators.required,
        Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]+$')
      ])),
      confirmPassword: new FormControl('', Validators.required)
    }, (formGroup: FormGroup) => {
      return PasswordValidator.areEqual(formGroup);
    });

    this.customerForm = this.formBuilder.group({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      phone: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[1-9][0-9]{9,11}$')
      ])),
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9\._-]+@[a-zA-Z0-9\.-]+\.[a-zA-Z]{2,6}$')
      ])),
      password: this.matchingPasswordsGroup,
      terms: new FormControl(false, Validators.pattern('true')),
    });
  }

  conditions() {
    let conditionModal = this.modalCtrl.create('ConsumerConditionsPage');
    conditionModal.onDidDismiss(data => {
      let condition = data.condition;
      if (condition) {
        if (condition === 'accept') {
          this.customerForm.get('terms').setValue(true);
        }
        else {
          this.customerForm.get('terms').setValue(false);
        }
      } else {
        this.customerForm.get('terms').setValue(false);
      }
    });
    conditionModal.present();
  }

  validationMessages = {
    'firstname': [
      { type: 'required', message: 'First name is required.' }
    ],
    'lastname': [
      { type: 'required', message: 'Last name is required.' }
    ],
    'phone': [
      { type: 'required', message: 'Phone is required.' },
      { type: 'validCountryPhone', message: 'Phone incorrect for the country selected' }
    ],
    'email': [
      { type: 'required', message: 'Email is required.' },
      { type: 'pattern', message: 'Enter a valid email.' }
    ],
    'password': [
      { type: 'required', message: 'Password is required.' },
      { type: 'minlength', message: 'Password must be at least 5 characters long.' },
      { type: 'pattern', message: 'Your password must contain at least one uppercase, one lowercase, and one number.' }
    ],
    'confirmPassword': [
      { type: 'required', message: 'Confirm password is required' }
    ],
    'terms': [
      { type: 'pattern', message: 'You must accept terms and conditions.' }
    ]
  };
}