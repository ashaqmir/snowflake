import { Component, Injector } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  LoadingController,
  ModalController
} from "ionic-angular";
import * as moment from "moment";
import { IProduct, IProfile, IAddress, IOrder } from "../../../models/models";
import {
  AppStateServiceProvider,
  AuthServiceProvider,
  OrderServiceProvider
} from "../../../providers/providers";
import { isAuthorized } from "../../../decorators/isAuthorized";


@isAuthorized
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
  addAdultStep = 0;
  finalPricePerPerson: number;
  totalPrice: number;
  private appState: any;
  authSubs: any;

  currentKids = 0;
  perKidPrice = 0.0;

  arrivalOnDate: any;
  arrivalOnTime: any;
  minDate: any;
  maxDate: any;
  advanceDays = 7;

  disablePayment = true;
  orderDetails: IOrder = new IOrder();
  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private loadingCtrl: LoadingController,
    public modelCtrl: ModalController,
    public injector: Injector,
    private authProvider: AuthServiceProvider,
    private ordrService: OrderServiceProvider,
    appState: AppStateServiceProvider
  ) {
    this.appState = appState;
    this.product = this.navParams.get("selectedProduct");
    if (this.product) {
      this.addAdultStep = this.product.personAddOption;

      this.currentPersons = this.product.pricefor;
      this.orderDetails.Package = Object.assign({}, this.product);

      console.log(`CURRENT PERSONS: ${this.currentPersons}`);
      if (this.product.childrenAllowed) {
        this.currentKids = this.product.children;
        this.perKidPrice =
          this.product.finalPrice /
          this.product.pricefor *
          this.product.childPriceFactor;
      }
      this.finalPricePerPerson =
        this.product.finalPrice / this.product.pricefor;

      console.log(`PER PERSON: ${this.finalPricePerPerson}`);
      this.totalPrice = this.product.finalPrice;
      console.log(`TOTAL FOR GROUP: ${this.totalPrice}`);
    }
    this.setMinMaxDates();
    console.log(this.minDate);
  }

  ionViewCanEnter() {
    //return this.appState.loginState;
  }

  ionViewWillLoad() {
    if (this.appState.userProfile && this.appState.loginState) {
      this.userProfile = this.appState.userProfile;
      this.uid = this.userProfile.$key;
      this.orderDetails.customerId = this.userProfile.$key;
      this.orderDetails.customerEmail = this.userProfile.email;

      if (this.userProfile.Addresses) {
        if (this.userProfile.Addresses.length == 1) {
          this.shippingAddress = this.userProfile.Addresses[0];
        } else {
          this.shippingAddress = this.userProfile.Addresses.find(
            adr => adr.isDefault
          );
        }
        this.disablePayment = false;
        this.orderDetails.customerAddress = this.shippingAddress;
      }
    }
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
              this.disablePayment = false;
              this.orderDetails.customerAddress = this.shippingAddress;
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
            this.orderDetails.customerAddress = this.shippingAddress;
          }
        });

        addressModel.present();
      }
    }
  }
  kidsChanged() {
    this.calculateTotalPrice();
  }

  personChanged() {
    this.calculateTotalPrice();
  }

  calculateTotalPrice() {
    const adultPrice = this.finalPricePerPerson * this.currentPersons;
    let kidsPrice = 0.0;
    if (
      this.product.childrenAllowed &&
      this.product.children > 0 &&
      this.currentKids > this.product.children
    ) {
      const kidsAdded = this.currentKids - this.product.children;
      kidsPrice = this.perKidPrice * kidsAdded;
    } else if (
      this.product.childrenAllowed &&
      this.currentKids > this.product.children
    ) {
      kidsPrice = this.perKidPrice * this.currentKids;
    }

    this.totalPrice = adultPrice + kidsPrice;
  }

  setMinMaxDates() {
    const today = moment();
    this.minDate = today.add(this.advanceDays, "d").format("YYYY-MM-DD");
    this.maxDate = today.add(this.advanceDays, "M").format("YYYY-MM-DD");
    this.arrivalOnDate = this.minDate;
    this.arrivalOnTime = today.format("HH:mm");

    console.log(this.minDate);
    console.log(this.maxDate);
    console.log(this.arrivalOnDate);
    console.log(this.arrivalOnTime);
  }

  submitOrder() {
    this.orderDetails.customerAddress = this.shippingAddress;
    this.orderDetails.adults = this.currentPersons;
    this.orderDetails.children = this.currentKids;
    this.orderDetails.customerPaid = this.totalPrice;

    this.orderDetails.paymentType = 'Cash On Arrival';
    this.orderDetails.paymentState = 'Not Paid';

    this.orderDetails.arrivalDate = this.arrivalOnDate;
    this.orderDetails.arrivalTime = this.arrivalOnTime;

    delete this.orderDetails.Package.$key;

    console.log('Order Details');
    console.log(this.orderDetails);
    console.log('Product')
    console.log(this.product);
    this.ordrService.createOrder(this.orderDetails);
  }
}
