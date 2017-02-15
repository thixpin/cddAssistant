import { Component } from '@angular/core';
import { NavController, App, ViewController } from 'ionic-angular';
import { DataService } from '../../providers/data-service';
import { SettingsPage } from '../settings/settings';
import { TabsPage } from '../tabs/tabs';
import { AboutPage } from '../about/about';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  host = '';
  post = '';
  pages: Array<{title: string, name: string, color: string, component: any}>;

  constructor(  public navCtrl: NavController, 
                private DataService: DataService, 
                public viewCtrl: ViewController,
                public appCtrl: App
              ) {
    this.pages = [
      { title: 'Contacts', name: 'ios-contact-outline', color: 'secondary', component: TabsPage },
      { title: 'Settings', name: 'ios-settings-outline', color: 'primary', component: SettingsPage },
      { title: 'About Application', name: 'ios-information-circle-outline', color: 'dark', component: AboutPage }
    ];
  }
  

  openPage(page) {
    //this.navCtrl.push(page.component);
    this.appCtrl.getRootNav().push(page.component);
    this.viewCtrl.dismiss();
  }


  ionViewDidLoad(){
    this.DataService.loadSetting();
    setTimeout((result) => {
      let downloaded = this.DataService.getSetting().downloaded;
      //console.log(this.DataService.getSetting());
      if(!downloaded){
        this.navCtrl.push(SettingsPage);
      } 
    }, 500);
  }
}
