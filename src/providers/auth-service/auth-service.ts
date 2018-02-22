import { Injectable } from "@angular/core";
import "rxjs/add/operator/map";
import { AngularFireAuth } from "angularfire2/auth";
import { AngularFireDatabase } from "angularfire2/database";
import * as firebase from "firebase";
import { IProfile } from "../../models/profile";
import { AppStateServiceProvider } from "../app-state-service/app-state-service";
import { LoadingController } from "ionic-angular/components/loading/loading-controller";
import { Events } from "ionic-angular";
@Injectable()
export class AuthServiceProvider {
  private basePath = "/Profiles";

  appState: any;

  constructor(
    public events: Events,
    private afAuth: AngularFireAuth,
    public afDb: AngularFireDatabase,
    appState: AppStateServiceProvider,
    public loadingCtrl: LoadingController
  ) {
    this.appState = appState;
  }

  loginUser(newEmail: string, newPassword: string): Promise<any> {
    return this.afAuth.auth
      .signInWithEmailAndPassword(newEmail, newPassword)
      .then(uState => {
        console.log(uState.uid);
        console.log(uState.emailVerified);
        if (uState.emailVerified) {
          this.setAuthState(uState.uid);
        }
        return uState;
      });
  }

  resetPassword(email: string): Promise<any> {
    return this.afAuth.auth.sendPasswordResetEmail(email);
  }

  logoutUser(): Promise<any> {
    console.log("user loge out...");
    return this.afAuth.auth
      .signOut()
      .then(() => {
        console.log("Logged out.");
        this.appState.clearData();
        if (!this.appState.userProfile) {
          this.events.publish("user:logout", this.appState.userProfile);
        }
      })
      .catch(err => {
        console.log(err);
      });
  }

  registerUser(email: string, password: string): Promise<any> {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password);
  }

  updateUserProfile(userProfile: IProfile, uid: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.afDb
        .object(`${this.basePath}/${uid}`)
        .set(userProfile)
        .then(() => {
          this.events.publish("profile:updated");
          console.log("Profile Saved");
          resolve(userProfile);
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  updateProfileProps(userId, value) {
    const profRef = this.afDb.object(`/${this.basePath}/${userId}`);
    profRef.update(value).then(() => {
      this.events.publish("profile:updated");
    });
  }

  deleteUserProfile(uid: string): Promise<any> {
    return this.afDb.object(`${this.basePath}/${uid}`).remove();
  }

  uploadImage(image: string, userId: string): any {
    let loadingPopup = this.loadingCtrl.create({
      spinner: "crescent",
      content: ""
    });
    loadingPopup.present();

    let storageRef = firebase.storage().ref("ProfileImages");
    let imageRef = storageRef.child(`${userId}.jpg`);
    return imageRef
      .putString(image, "data_url")
      .then(data => {
        if (data) {
          console.log('good things happen');
          const profRef = this.afDb.object(`/${this.basePath}/${userId}`);
          profRef.update({ profilePicUrl: data.downloadURL });
          this.getUserProfile(userId);
          loadingPopup.dismiss();
        } else {
          console.log('something is wrong');
        }
      })
      .catch(error => {
        console.log(error);
        loadingPopup.dismiss();
      });
  }

  getUserProfile(uid): Promise<IProfile> {
    return new Promise(resolve => {
      const profRef = this.afDb.object(`/${this.basePath}/${uid}`);

      const profSubs = profRef.snapshotChanges().subscribe(profData => {
        const userProfile = profData.payload.val();
        if (userProfile) {
          this.appState.userProfile = userProfile;
          this.appState.userProfile.$key = profData.key;
          if (this.appState.userProfile) {
            this.events.publish("profile:recieved", this.appState.userProfile);
          }
          resolve(userProfile);
          profSubs.unsubscribe();
        }
      });
    });
  }

  private setAuthState(uid) {
    this.getUserProfile(uid).then(() => {
      this.appState.loginState = true;
    });
  }
}
