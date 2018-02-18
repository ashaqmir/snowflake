import { Component, Injector } from "@angular/core";
import {
  IonicPage,
  NavController,
  LoadingController,
  AlertController,
  ToastController,
  ActionSheetController
} from "ionic-angular";
import { AngularFireDatabase } from "angularfire2/database";
import { AngularFireAuth } from "angularfire2/auth";
import { IProfile } from "../../models/profile";
import {
  AppStateServiceProvider,
  AuthServiceProvider,
  ImageProvider
} from "../../providers/providers";
import { isAuthorized } from "../../decorators/isAuthorized";

@isAuthorized
@IonicPage()
@Component({
  selector: "page-user-profile",
  templateUrl: "user-profile.html"
})
export class UserProfilePage {
  profilePicture: any = "./assets/imgs/chatterplace.png";
  userProfile: IProfile;
  profileChanged: boolean = false;
  private appState: any;

  constructor(
    public navCtrl: NavController,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public actionSheetCtrl: ActionSheetController,
    public toastCtrl: ToastController,
    public injector: Injector,
    appState: AppStateServiceProvider,
    public afAuth: AngularFireAuth,
    public afDb: AngularFireDatabase,
    public authProvider: AuthServiceProvider,
    public imgProvider: ImageProvider
  ) {
    this.appState = appState;
  }
  ionViewWillLoad() {
    this.userProfile = this.appState.userProfile;
  }

  ionViewDidLoad() {
    this.appState.currentView = "UserProfilePage";
  }
  ionViewDidLeave() {
    this.appState.currentView = "";
  }

  presentAlert(title) {
    let alert = this.alertCtrl.create({
      title: title,
      buttons: ["OK"]
    });
    alert.present();
  }

  presentToast(position: string, message: string) {
    let toast = this.toastCtrl.create({
      message: message,
      position: position,
      duration: 3000
    });
    toast.present();
  }

  showImageOption() {
    let actionSheet = this.actionSheetCtrl.create({
      title: "Select source",
      buttons: [
        {
          text: "Image Gallery",
          icon: "images",
          handler: () => {
            this.changeImage("lib");
          }
        },
        {
          text: "Camera",
          icon: "camera",
          handler: () => {
            this.changeImage("cam");
          }
        }
      ]
    });
    actionSheet.present();
  }
  showNameDialog() {
    let prompt = this.alertCtrl.create({
      title: "Update Name",
      message: "Enter your name",
      inputs: [
        {
          name: "firstName",
          placeholder: "First name...",
          value: this.userProfile.firstName
        },
        {
          name: "lastName",
          placeholder: "Last name...",
          value: this.userProfile.lastName
        }
      ],
      buttons: [
        {
          text: "Cancel",
          handler: data => {
            console.log("Cancel clicked");
          }
        },
        {
          text: "Save",
          handler: data => {
            if (data && data.firstName && data.lastName) {
              this.authProvider.updateProfileProps(this.userProfile.$key, {
                firstName: data.firstName,
                lastName: data.lastName
              });
              this.userProfile = this.appState.userProfile;
            }
          }
        }
      ]
    });
    prompt.present();
  }
  changeImage(sourceType) {
    console.log("Change Image");
    this.imgProvider
      .selectImage(sourceType)
      .then(imgData => {
        if (imgData) {
          this.profilePicture = imgData;
          this.profileChanged = true;
        }
      })
      .catch(error => {
        console.log(error);
      });
  }

  saveProfileImage() {
    if (this.profilePicture) {
      this.authProvider.uploadImage(this.profilePicture, this.userProfile.$key);
      this.profileChanged = false;
    }
  }
}
