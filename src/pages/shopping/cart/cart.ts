import { Component, Injector } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  LoadingController,
  ModalController,
  AlertController
} from "ionic-angular";
import * as moment from "moment";
import { IProduct, IProfile, IAddress, IOrder } from "../../../models/models";
import {
  AppStateServiceProvider,
  AuthServiceProvider,
  OrderServiceProvider,
  StorageHelperProvider
} from "../../../providers/providers";
import { isAuthorized } from "../../../decorators/isAuthorized";

declare var RazorpayCheckout: any;

@isAuthorized
@IonicPage()
@Component({
  selector: "page-cart",
  templateUrl: "cart.html"
})
export class CartPage {
  product: IProduct;
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

  paymentOptions: any;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private loadingCtrl: LoadingController,
    public modelCtrl: ModalController,
    public alertCtrl: AlertController,
    public injector: Injector,
    private authProvider: AuthServiceProvider,
    private ordrService: OrderServiceProvider,
    private storageHelper: StorageHelperProvider,
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

        const customerName = `${this.userProfile.firstName} ${
          this.userProfile.lastName
        }`;
        this.paymentOptions = {
          description: "Credits towards service",
          image: "../../../assets/imgs/package.png",
          currency: "INR",
          key: "rzp_test_3aC2S00lzpyhCs",
          //amount: this.orderDetails.customerPaid.toFixed(2).toString(),
          amount: "",
          name: customerName,
          prefill: {
            email: this.userProfile.email,
            contact: this.userProfile.phone,
            name: customerName
          },
          theme: {
            color: "#F37254"
          },
          modal: {
            ondismiss: function() {
              let cancelAlert = this.alertCtrl.create({
                title: "Payment canceled!",
                subTitle: "Payment was canceled!",
                buttons: ["OK"]
              });
              cancelAlert.present();
            }
          }
        };
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

    const uid = this.userProfile.$key;
    this.userProfile.Addresses.push(address);
    this.userProfile.$key = undefined;
    delete this.userProfile.$key;
    this.authProvider
      .updateUserProfile(this.userProfile, uid)
      .then(() => {
        this.authProvider.getUserProfile(uid).then(profile => {
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

    this.orderDetails.paymentType = "Cash On Arrival";
    this.orderDetails.paymentState = "Not Paid";

    this.orderDetails.arrivalDate = this.arrivalOnDate;
    this.orderDetails.arrivalTime = this.arrivalOnTime;

    this.orderDetails.reference = `[${this.product.name}][${
      this.totalPrice
    }][${new Date().toString()}]`;
    delete this.orderDetails.Package.$key;

    console.log("Product");
    console.log(this.product);

    const cutomerPays =
      Math.round(this.orderDetails.customerPaid).toString() + "00";
    console.log(cutomerPays);
    if (this.orderDetails) {
      let loadingPopup = this.loadingCtrl.create({
        spinner: "crescent",
        content: ""
      });
      loadingPopup.present();

      console.log(this.orderDetails);
      //INTIALIZE PAYMENT
      this.paymentOptions.amount = cutomerPays;
      if (this.paymentOptions && this.paymentOptions.amount) {
        var successCallback = function(payment_id) {
          this.orderDetails.paymentState = "Authorized";
          this.orderDetails.paymentType = "Razor";
          this.orderDetails.paymentId = payment_id;
          this.saveOrderToDb(this.orderDetails).then(res => {
            this.navCtrl.setRoot("OrderFinalPage", {
              finalOrder: this.orderDetails,
              userLastName: this.userProfile.lastName
            });
          });
        }.bind(this);

        var cancelCallback = function(error) {
          const oopsAlert = this.alertCtrl.create({
            title: "Oops!",
            subTitle: "Something went wrong. Please try again later.",
            buttons: ["OK"]
          });
          oopsAlert.present();
        }.bind(this);

        RazorpayCheckout.open(
          this.paymentOptions,
          successCallback,
          cancelCallback
        );
      }
      loadingPopup.dismiss();
    }
  }

  saveOrderToDb(orderDetails): Promise<boolean> {
    console.log("Order Details");
    console.log(this.orderDetails);

    return new Promise((resolve, reject) => {
      this.ordrService.createOrder(this.orderDetails).then(res => {
        if (res) {
          this.storageHelper.removeItem("lastCartItem");
          return resolve(true);
        } else {
          return reject(true);
        }
      });
    });
  }
}
