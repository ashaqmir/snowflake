import { NgModule } from '@angular/core';
import { IonicPageModule, IonicPage } from 'ionic-angular';
import { ConsumerSignupPage } from './consumer-signup';

@IonicPage()
@NgModule({
  declarations: [
    ConsumerSignupPage,
  ],
  imports: [
    IonicPageModule.forChild(ConsumerSignupPage),
  ],
})
export class SignupPageModule {}
