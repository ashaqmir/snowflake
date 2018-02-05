import { Component, ViewChild } from "@angular/core";
import {
  Nav,
  Platform,
  Events,
  MenuController,
  ToastController,
  LoadingController
} from "ionic-angular";
import { StatusBar } from "@ionic-native/status-bar";
import { SplashScreen } from "@ionic-native/splash-screen";
import { AuthServiceProvider } from "../providers/auth-service/auth-service";
import { AppStateServiceProvider } from "../providers/app-state-service/app-state-service";
import {
  FormBuilder,
  FormGroup,
  FormControl,
  Validators
} from "@angular/forms";
import { IProfile } from "../models/profile";
import { StorageHelperProvider } from "../providers/storage-helper/storage-helper";

@Component({
  templateUrl: "app.html"
})
export class MyApp {
  @ViewChild(Nav) nav: Nav;
  rootPage: any = "ProductListPage";
  selectedTheme: string = "light-theme";

  menuItems: Array<any> = [];
  userProfImage: string = "assets/imgs/chatterplace.png";
  user: IProfile;
  appState: any;
  loginForm: FormGroup;
  rememberMe: false;

  constructor(
    platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public formBuilder: FormBuilder,
    public events: Events,
    public menuCtrl: MenuController,
    private toast: ToastController,
    private loadingCtrl: LoadingController,
    private authProvider: AuthServiceProvider,
    private storageProvider: StorageHelperProvider,
    appState: AppStateServiceProvider
  ) {
    this.appState = appState;
    this.createForm();
    platform.ready().then(() => {
      this.initializeApp();
      this.storageProvider.getLastUser().then(lastUsr => {
        console.log(lastUsr);
        if (lastUsr && lastUsr.email && lastUsr.password) {
          this.signIn(lastUsr);
        }
      });
    });
  }

  initializeApp() {
    this.statusBar.styleDefault();
    this.splashScreen.hide();

    this.createMenuItems();
    this.hookupMenuFunctionality();
  }

  hookupMenuFunctionality() {
    this.events.subscribe("profile:recieved", profile => {
      if (profile !== undefined && profile !== "") {
        this.user = profile;
        if (this.user && this.user.profilePicUrl) {
          this.userProfImage = this.user.profilePicUrl;
        }
      }
    });

    this.user = this.appState.userProfile;
    if (this.user && this.user.profilePicUrl) {
      this.userProfImage = this.user.profilePicUrl;
    }
    this.events.subscribe("user:logout", profile => {
      if (!profile) {
        this.user = null;
      }
    });
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
          let emailVerified = data.emailVerified;
          if (emailVerified) {
            this.appState.loginState = true;
            console.log(data.uid);
            this.authProvider.getUserProfile(data.uid).then(data => {
              console.log("Data Loaded");
              this.user = this.appState.userProfile;
              console.log(this.appState.userProfile);
              if (this.appState.userProfile) {
                console.log("Profile loade");
                if (this.rememberMe) {
                  this.storageProvider.setLastUser({
                    email: email,
                    password: password
                  });
                }

                loadingPopup.dismiss();
                this.menuCtrl.close();
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
            this.nav.push("EmailVerificationPage");
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
  goToSignup() {
    this.nav.push("ConsumerSignupPage").then(() => {
      this.menuCtrl.close();
    });
  }
  openPage(page) {
    if (page.type === "page") {
      this.updateActive();
      page.isActive = true;
      this.nav.push(page.componentName).catch(err => console.error(err));
      this.menuCtrl.close();
    } else if (page.type.startsWith("action")) {
      this.doAction(page.type);
      this.menuCtrl.close();
    }
  }
  doAction(action: string) {
    if (action === "action:logout") {
      this.authProvider.logoutUser();
    }
  }
  updateActive() {
    this.menuItems.forEach(page => {
      page.isActive = false;
    });
  }
  createForm() {
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
  }

  createMenuItems() {
    this.menuItems = [
      {
        icon: "cart",
        name: "Shopping",
        componentName: "ProductListPage",
        type: "page",
        isActive: false
      },
      {
        icon: "calendar",
        name: "Appointments",
        componentName: "ConsumerAppointmentsPage",
        type: "page",
        isActive: false
      },
      {
        icon: "bicycle",
        name: "Health",
        componentName: "HealthPage",
        type: "page",
        isActive: false
      },
      {
        icon: "person",
        name: "Profile",
        componentName: "UserProfilePage",
        type: "page",
        isActive: false
      },
      {
        icon: "settings",
        name: "Preference",
        componentName: "PreferencesPage",
        type: "page",
        isActive: false
      },
      {
        icon: "lock",
        name: "Logout",
        component: "",
        type: "action:logout",
        isActive: false
      }
    ];
  }

  validationMessages = {
    email: [
      { type: "required", message: "Email is required." },
      { type: "pattern", message: "Enter a valid email." }
    ],
    password: [{ type: "required", message: "Password is required." }]
  };
}
