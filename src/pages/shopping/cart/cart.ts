import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  LoadingController,
  ModalController,
  Events
} from "ionic-angular";
import { IProduct, IProfile, IAddress } from "../../../models/models";
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase } from "angularfire2/database";
import {
  AppStateServiceProvider,
  AuthServiceProvider
} from "../../../providers/provider";

@IonicPage()
@Component({
  selector: "page-cart",
  templateUrl: "cart.html"
})
export class CartPage {
  product: IProduct;
  uid: string;
  userProfile: IProfile;
  shippingAddress: IAddress;
  currentPersons: number;
  finalPricePerPerson: number;
  totalPrice: number;
  private appState: any;
  authSubs: any;
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private loadingCtrl: LoadingController,
    public modelCtrl: ModalController,
    private events: Events,
    private afAuth: AngularFireAuth,
    private afDb: AngularFireDatabase,
    private authProvider: AuthServiceProvider,
    appState: AppStateServiceProvider
  ) {
    this.appState = appState;
    this.product = this.navParams.get("selectedProduct");
    if (this.product) {
      this.currentPersons = this.product.pricefor;
      console.log(`CURRENT PERSONS: ${this.currentPersons}`);
      this.finalPricePerPerson =
        this.product.finalPrice / this.product.pricefor;
      console.log(`PER PERSON: ${this.finalPricePerPerson}`);
      this.totalPrice = this.product.finalPrice;
      console.log(`TOTAL FOR GROUP: ${this.totalPrice}`);
    }
  }

  ionViewCanEnter() {
    return this.appState.loginState;
  }
  ionViewDidLoad() {
    console.log("ionViewDidLoad CartPage");
  }

  ionViewWillLoad() {
    let loadingPopup = this.loadingCtrl.create({
      spinner: "crescent",
      content: ""
    });
    loadingPopup.present();

    if (this.appState.userProfile && this.appState.loginState) {
      this.userProfile = this.appState.userProfile;
      if (this.userProfile.Addresses) {
        if (this.userProfile.Addresses.length == 1) {
          this.shippingAddress = this.userProfile.Addresses[0];
        } else {
          this.shippingAddress = this.userProfile.Addresses.find(
            adr => adr.isDefault
          );
        }
      }
      loadingPopup.dismiss();
    } else {
      console.log(" I was in cart auth false");
      loadingPopup.dismiss();
      this.navCtrl.setRoot("LoginPage");
    }
    // this.afAuth.authState.subscribe(userAuth => {
    //   if (userAuth) {
    //     this.uid = userAuth.uid;
    //     this.userProfile = this.appState.userProfile;
    //     console.log(this.userProfile);

    //     if (this.userProfile) {
    //       console.log("Shout out");
    //       if (this.userProfile.Addresses) {
    //         if (this.userProfile.Addresses.length == 1) {
    //           this.shippingAddress = this.userProfile.Addresses[0];
    //         } else {
    //           this.shippingAddress = this.userProfile.Addresses.find(
    //             adr => adr.isDefault
    //           );
    //         }
    //       }
    //     }
    //     loadingPopup.dismiss();
    //   } else {
    //     console.log(" I was in cart auth false");
    //     loadingPopup.dismiss();
    //     this.navCtrl.setRoot("LoginPage");
    //   }
    // });
  }
  addAddress() {
    let addressModel = this.modelCtrl.create("AddressFormPage");

    addressModel.onDidDismiss(data => {
      if (data && data.address) {
        this.addAddressToProfile(data.address);
      }
    });

    addressModel.present();
  }
  addAddressToProfile(addressObj) {
    let address = {} as IAddress;

    address = addressObj;
    console.log(address);
    let loadingPopup = this.loadingCtrl.create({
      spinner: "crescent",
      content: ""
    });
    loadingPopup.present();

    if (!this.userProfile.Addresses) {
      this.userProfile.Addresses = [] as IAddress[];
    }
    if (address.isDefault) {
      this.userProfile.Addresses.forEach(adr => {
        adr.isDefault = false;
      });
    }

    this.userProfile.Addresses.push(address);
    this.userProfile.$key = undefined;
    delete this.userProfile.$key;
    this.authProvider
      .updateUserProfile(this.userProfile, this.uid)
      .then(() => {
        this.authProvider.getUserProfile(this.uid).then(profile => {
          this.userProfile = profile;
          if (this.userProfile) {
            console.log("Shout out again");
            if (this.userProfile.Addresses) {
              if (this.userProfile.Addresses.length == 1) {
                this.shippingAddress = this.userProfile.Addresses[0];
              } else {
                this.shippingAddress = this.userProfile.Addresses.find(
                  adr => adr.isDefault
                );
              }
            }
          }
          loadingPopup.dismiss();
        });

        //this.navCtrl.push(CartPage, { selectedProduct: this.product });
      })
      .catch(error => {
        console.log(error);
        loadingPopup.dismiss();
      });
  }

  changeAddress() {
    if (this.userProfile && this.userProfile.Addresses) {
      if (this.userProfile.Addresses.length > 1) {
        let addressModel = this.modelCtrl.create("AddressListPage", {
          addressList: this.userProfile.Addresses
        });

        addressModel.onDidDismiss(data => {
          if (data && data.address) {
            this.shippingAddress = data.address;
          }
        });

        addressModel.present();
      }
    }
  }
  removePersons() {
    const step = this.product.personAddOption;
    const personFor = this.currentPersons - step;
    console.log(personFor);
    if (personFor >= this.product.pricefor) {
      this.currentPersons = personFor;

      this.totalPrice = this.finalPricePerPerson * personFor;
      //this.product.finalPrice = totalPrice;
      console.log(`Total Price for group: ${this.totalPrice}`);
    }
  }
  addPersons() {
    const step = this.product.personAddOption;
    const personFor = this.currentPersons + step;
    console.log(personFor);
    if (personFor >= this.product.pricefor) {
      this.currentPersons = personFor;

      this.totalPrice = this.finalPricePerPerson * personFor;
      //this.product.finalPrice = totalPrice;
      console.log(`Total Price for group: ${this.totalPrice}`);
    }
  }
}
