import { Injector } from "@angular/core";
import { NavController } from "ionic-angular";
import { AppStateServiceProvider } from "../providers/providers";

export function isAuthorized(target: Function) {
  console.log("Is Authorized called");
  target.prototype.ionViewCanEnter = function() {
    let isAuth = this.injector.get(AppStateServiceProvider).loginState;
    console.log(`Auth state: ${isAuth}`);
    if (!isAuth) {
      console.log("redirecting...");
      let navCtrl = this.injector.get(NavController);
      navCtrl.setRoot("LoginPage");
    }
    return isAuth || true;
  };
}
