import { Component } from "@angular/core";
import {
  IonicPage,
  NavController,
  NavParams,
  ViewController
} from "ionic-angular";
import { IAddress } from "../../models/models";

@IonicPage()
@Component({
  selector: "page-address-list",
  templateUrl: "address-list.html"
})
export class AddressListPage {
  addressList: IAddress[];
  selectedAddress: IAddress;
  hasAddresses: boolean = false;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public viewCtrl: ViewController
  ) {
    this.addressList = navParams.get("addressList");
    if (this.addressList) {
      this.hasAddresses = true;
      console.log(this.addressList);
    }
  }

  selectAddress(addr: IAddress) {
    if (addr && addr.street) {
      this.viewCtrl.dismiss({ address: addr });
    }
  }
}
