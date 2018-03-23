import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { CallNumber } from 'ionic-native';
import { DataService } from '../../providers/data-service';
import { ProfilePage } from '../profile/profile';

@Component({
  selector: 'page-office',
  templateUrl: 'office.html'
})
export class OfficePage {
  private staffs: Array<Object>;
  private lang: string = 'en'; 
  private genderIcon: Object;
  private positions: Array<Object>;

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

  public openProfile(item){
    //console.log(item);
    var _p = this.positions.filter(function(p){
      return Number(p['position_id']) == item['subposition_id'];
    });
    if(_p.length > 0){
      var position = _p[0];
      item['position'] = position['name'];
    } else {
      item['position'] =  {en: "Unknow Position", my: "-", zg: "-"};
    }
    this.navCtrl.push(ProfilePage, {
      staff: item,
      villager: false
    });
  }

  public callNow(number){
    number =  number.split(',');
    number =  number[0];
    number =  number.replace( /\u0020/g, "");
    number =  number.replace( /\u002D/g, "");
    CallNumber.callNumber(number, true)
    .then(() => console.log('Launched dialer!'))
    .catch(() => console.log('Error launching dialer'));
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad OfficePage');
    this.lang = this.DataService.language();
    this.genderIcon = this.DataService.genderIcon();
    this.positions = this.DataService.getPosition();


    this.DataService.table('staffs').getItem('office')
    .then((result) => {
      this.staffs = result ? <Array<Object>> result : [];
      //console.log(this.staffs );
    }, (error) => {
      console.log("ERROR: ", error);
    });
  }

}
