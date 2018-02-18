import { BrowserModule } from "@angular/platform-browser";
import { ErrorHandler, NgModule } from "@angular/core";
import { IonicApp, IonicErrorHandler, IonicModule } from "ionic-angular";
import { SplashScreen } from "@ionic-native/splash-screen";
import { StatusBar } from "@ionic-native/status-bar";

import { MyApp } from "./app.component";
import { ProductListPage } from "../pages/shopping/product-list/product-list";
import { AngularFireModule } from "angularfire2";
import { AngularFireAuthModule } from "angularfire2/auth";
import { AngularFireDatabaseModule } from "angularfire2/database";
import { IonicStorageModule } from "@ionic/storage";
import {
  AppStateServiceProvider,
  AuthServiceProvider,
  StorageHelperProvider,
  ImageProvider,
  ProductServiceProvider
} from "../providers/providers";
import { ProductListPageModule } from "../pages/shopping/product-list/product-list.module";
import { Camera } from "@ionic-native/camera";
import { OrderServiceProvider } from '../providers/order-service/order-service';


const firebaseConfig = {
  apiKey: "AIzaSyBxDGtr-xtsPUNY5-LNvaQQCWT6ug8T3W8",
    authDomain: "snowflake-tours-travels.firebaseapp.com",
    databaseURL: "https://snowflake-tours-travels.firebaseio.com",
    projectId: "snowflake-tours-travels",
    storageBucket: "snowflake-tours-travels.appspot.com",
    messagingSenderId: "399950243499"
};

@NgModule({
  declarations: [MyApp],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireModule.initializeApp(firebaseConfig),
    IonicStorageModule.forRoot({
      name: "__snowDb"
    }),
    AngularFireAuthModule,
    AngularFireDatabaseModule,
    ProductListPageModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [MyApp, ProductListPage],
  providers: [
    StatusBar,
    SplashScreen,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    Camera,
    ProductServiceProvider,
    AppStateServiceProvider,
    AuthServiceProvider,
    StorageHelperProvider,
    ImageProvider,
    OrderServiceProvider
  ]
})
export class AppModule {}
