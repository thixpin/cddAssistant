import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { CallNumber } from 'ionic-native';
import { DataService } from '../../providers/data-service';

@Component({
  selector: 'page-profile',
  templateUrl: 'profile.html'
})
export class ProfilePage {
  private staff: Object;
  private lang: string = 'en'; 
  private positions: Array<Object>;
  private villager: boolean = false;

  _lbl = [
    {en: 'Mobile Phone', my: 'လက်ကိုင်ဖုန်း', zg: 'လက္ကိုင္ဖုန္း'},
    {en: 'Email', my: 'အီးမေး', zg: 'အီးေမး'},
    {en: 'Birth Day', my: 'မွေးသက္ကရာဇ်', zg: 'ေမြးသကၠရာဇ္'  },
    {en: 'Address', my: 'နေရပ်လိပ်စာ', zg: ' ေနရပ္လိပ္စာ'  },
    {en: 'Emergency Contact', my: 'အရေးပေါ်ဆက်သွယ်ရန်', zg: 'အေရးေပၚဆက္သြယ္ရန္'}

  ];

  constructor(  public navCtrl: NavController, 
                public navParams: NavParams,
                public alertCtrl: AlertController,
                private DataService: DataService
  ) {}
  
  public getPost(position_id){
    var _p = this.positions.filter(function(p){
      return Number(p['position_id']) == position_id;
    });
    if(_p.length > 0){
      var position = _p[0];
      return position['name'];
    } else {
      return {en: "Unknow Position", my: "-", zg: "-"};
    }
  }

  public callNow(number){
    number =  number.replace( /\u0020/g, "");
    number =  number.replace( /\u002D/g, "");
    CallNumber.callNumber(number, true)
    .then(() => console.log('Launched dialer!'))
    .catch(() => console.log('Error launching dialer'));
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad ProfilePage');
    this.lang = this.DataService.language();
    this.staff = this.navParams.get('staff');
    this.villager = this.navParams.get('villager');
    this.positions = this.DataService.getPosition();
    //console.log(this.staff);

  }

}
