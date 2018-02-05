import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ConsumerConditionsPage } from './consumer-conditions';

@NgModule({
  declarations: [
    ConsumerConditionsPage,
  ],
  imports: [
    IonicPageModule.forChild(ConsumerConditionsPage),
  ],
})
export class ConsumerConditionsPageModule {}
