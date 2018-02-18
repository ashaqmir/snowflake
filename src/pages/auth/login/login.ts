import { Component } from "@angular/core";
import { NavController, IonicPage, ToastController } from "ionic-angular";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from "@angular/forms";
import { LoadingController } from "ionic-angular/components/loading/loading-controller";
import { Events } from "ionic-angular/util/events";
import { IProfile } from "../../../models/profile";
import {
  AppStateServiceProvider,
  AuthServiceProvider,
  StorageHelperProvider
} from "../../../providers/providers";

@IonicPage()
@Component({
  selector: "page-login",
  templateUrl: "login.html"
})
export class LoginPage {
  isReadyToLogin: boolean;
  item: any;
  form: FormGroup;
  loginForm: FormGroup;
  userProfile: IProfile;
  rememberMe: boolean = true;
  private appState: any;

  constructor(
    public navCtrl: NavController,
    public events: Events,
    public formBuilder: FormBuilder,
    private toast: ToastController,
    appState: AppStateServiceProvider,
    public authProvider: AuthServiceProvider,
    private loadingCtrl: LoadingController,
    private storageHelper: StorageHelperProvider
  ) {
    this.appState = appState;
  }

  ionViewWillLoad() {
    this.loginForm = this.formBuilder.group({
      email: new FormControl(
        "",
        Validators.compose([
          Validators.required,
          Validators.pattern("^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,6}$")
        ])
      ),
      password: new FormControl(
        "",
        Validators.compose([
          Validators.minLength(5),
          Validators.required,
          Validators.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])[a-zA-Z0-9]+$")
        ])
      )
    });

    this.storageHelper
      .getLastUser()
      .then(data => {
        if (data) {
          this.loginForm.get("email").setValue(data.userName);
          this.loginForm.get("password").setValue(data.userPwd);
        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  ionViewDidLoad() {
    console.log("Login loaded...");
  }

  goToSignupOptions() {
    this.navCtrl.push("SignupPage");
  }

  forgot() {
    this.navCtrl.push("ForgotPage");
  }

  async signIn(values) {
    const email = values.email;
    const password = values.password;
    let loadingPopup = this.loadingCtrl.create({
      spinner: "crescent",
      content: ""
    });
    loadingPopup.present();
    try {
      this.authProvider
        .loginUser(email, password)
        .then(data => {
          //let emailVerified = data.emailVerified;
          let emailVerified = true;
          if (emailVerified) {
            this.appState.loginState = true;
            console.log(data.uid);
            this.authProvider.getUserProfile(data.uid).then(data => {
              this.userProfile = this.appState.userProfile;
              console.log(this.appState.userProfile);
              if (this.rememberMe) {
                let lastUser = {
                  userName: email,
                  userPwd: password
                };

                this.storageHelper.setLastUser(lastUser);
              } else {
                this.storageHelper.removeLastUser();
              }
              if (this.appState.userProfile) {
                this.navCtrl.setRoot("ProductListPage");
                loadingPopup.dismiss();
              } else {
                console.log("User Profile not found");
                loadingPopup.dismiss();
                this.toast
                  .create({
                    message: "User profile not found!",
                    duration: 3000
                  })
                  .present();
              }
            });
          } else {
            console.log("Email not verified.");
            loadingPopup.dismiss();
            this.navCtrl.push("EmailVerificationPage");
          }
        })
        .catch(error => {
          var errorMessage: string = error.message;
          loadingPopup.dismiss().then(() => {
            this.toast
              .create({
                message: errorMessage,
                duration: 3000
              })
              .present();
          });
        });
    } catch (error) {
      this.toast
        .create({
          message: error.message,
          duration: 3000
        })
        .present();
    }
  }
  validationMessages = {
    email: [
      { type: "required", message: "Email is required." },
      { type: "pattern", message: "Enter a valid email." }
    ],
    password: [{ type: "required", message: "Password is required." }]
  };
}
