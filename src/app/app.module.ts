import { NgModule, ErrorHandler } from '@angular/core';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { MyApp } from './app.component';
import { AboutPage } from '../pages/about/about';
import { HomePage } from '../pages/home/home';
import { TabsPage } from '../pages/tabs/tabs';
import { OfficePage } from '../pages/office/office';
import { TfPage } from '../pages/tf/tf';
import { CfPage } from '../pages/cf/cf';
import { CmPage } from '../pages/cm/cm';
import { ProfilePage } from '../pages/profile/profile';
import { SettingsPage } from '../pages/settings/settings';
import { DataService } from '../providers/data-service';

@NgModule({
  declarations: [
    MyApp,
    AboutPage,
    HomePage,
    TabsPage,
    OfficePage,
    TfPage,
    CfPage,
    CmPage,
    ProfilePage,
    SettingsPage
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    AboutPage,
    HomePage,
    TabsPage,
    OfficePage,
    TfPage,
    CfPage,
    ProfilePage,
    CmPage,
    SettingsPage
  ],
  providers: [DataService, {provide: ErrorHandler, useClass: IonicErrorHandler}]
})
export class AppModule {}
