import { Component } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl
} from "@angular/forms";
import {
  IonicPage,
  NavController,
  NavParams,
  Events,
  ViewController,
  App,
  ToastController,
  LoadingController
} from "ionic-angular";
import { IProfile } from "../../models/profile";
import { AppStateServiceProvider } from "../../providers/app-state-service/app-state-service";
import { AuthServiceProvider } from "../../providers/auth-service/auth-service";

@IonicPage()
@Component({
  selector: "page-user-options",
  templateUrl: "user-options.html"
})
export class UserOptionsPage {
  menuItems: Array<any> = [];
  userProfImage: string = "assets/imgs/chatterplace.png";
  user: IProfile;
  appState: any;
  loginForm: FormGroup;
  constructor(
    public navCtrl: NavController,
    public app: App,
    public events: Events,
    public navParams: NavParams,
    public viewCtrl: ViewController,
    public formBuilder: FormBuilder,
    private toast: ToastController,
    private loadingCtrl: LoadingController,
    private authProvider: AuthServiceProvider,
    appState: AppStateServiceProvider
  ) {
    this.appState = appState;

    events.subscribe("profile:recieved", profile => {
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

    this.createMenuItems();
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
  }
  ionViewDidLoad() {
    console.log("ionViewDidLoad UserOptionsPage");
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
  goToSignup() {
    this.navCtrl.push("ConsumerSignupPage");
  }
  openPage(page) {
    if (page.type === "page") {
      this.updateActive();
      page.isActive = true;
      this.viewCtrl.dismiss().then(() => {
        console.log(this.app.getRootNav());
        this.app
          .getRootNav()
          .push(page.componentName)
          .catch(err => console.error(err));
      });
    } else if (page.type.startsWith("action")) {
      this.doAction(page.type);
    }
  }
  doAction(action: string) {
    // if (action === 'action:logout') {
    //   this.authProvider.logoutUser();
    //   this.viewCtrl.dismiss().then(() => {
    //     console.log(this.app.getRootNav());
    //     this.app.getRootNav().push(LoginPage).catch(err => console.error(err));
    //   });
    //   //this.navCtrl.setRoot(LoginPage).catch(err => console.error(err));
    //   //this.navCtrl.popToRoot();
    // }
  }

  updateActive() {
    this.menuItems.forEach(page => {
      page.isActive = false;
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
