import { NgModule } from '@angular/core';
import { IonicPageModule, IonicPage } from 'ionic-angular';
import { LoginPage } from './login';


@IonicPage()
@NgModule({
  declarations: [
    LoginPage,
  ],
  imports: [
    IonicPageModule.forChild(LoginPage)
  ],
})
export class LoginPageModule {}
