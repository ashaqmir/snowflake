import { Events } from 'ionic-angular';
import { Injectable } from '@angular/core';
import { IProfile } from '../../models/profile';


@Injectable()
export class AppStateServiceProvider {

  loginState: boolean = false;
  userProfile: IProfile;

  localStorageProfile: IProfile;
  userOrders: any[];
  currentView: string;
  constructor(public events: Events) {   
  }


  
  clearData() {
    this.loginState = false;
    this.userProfile = null;
    this.userOrders = null;
    
  }
}
