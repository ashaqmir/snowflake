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
    return this.afAuth.auth.signInWithEmailAndPassword(newEmail, newPassword);
  }

  resetPassword(email: string): Promise<any> {
    return this.afAuth.auth.sendPasswordResetEmail(email);
  }

  logoutUser(): Promise<any> {
    this.appState.clearData();
    if (!this.appState.userProfile) {
      this.events.publish("user:logout", this.appState.userProfile);
    }
    console.log('user logedout...');
    return this.afAuth.auth.signOut();
  }

  registerUser(email: string, password: string): Promise<any> {
    return this.afAuth.auth.createUserWithEmailAndPassword(email, password);
  }

  updateUserProfile(userProfile: IProfile, uid: string): Promise<any> {
    return this.afDb.object(`${this.basePath}/${uid}`).set(userProfile);
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
          const profRef = this.afDb.object(`/${this.basePath}/${userId}`);
          profRef.update({ profilePicUrl: data.downloadURL });
          this.getUserProfile(userId);
          loadingPopup.dismiss();
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

      profRef.snapshotChanges().subscribe(profData => {
        const userProfile = profData.payload.val();
        if (userProfile) {
          this.appState.userProfile = userProfile;
          if (this.appState.userProfile) {
            this.events.publish("profile:recieved", this.appState.userProfile);
          }
          resolve(userProfile);
        }
      });
    });
  }
}
