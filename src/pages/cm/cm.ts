import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { CallNumber } from 'ionic-native';
import { DataService } from '../../providers/data-service';
import { ProfilePage } from '../profile/profile';


@Component({
  selector: 'page-cm',
  templateUrl: 'cm.html'
})
export class CmPage {

  private title: any = "VPSC Members";
  private _staffs: Array<Object>;
  private staffs: Array<Object>;
  private lang: string = 'en'; 
  private genderIcon: Object;
  private positions: Array<Object>;
  private villages: Array<Object>;
  private current_village: Object = {vt_code: '022', village_code: "MMR0202022001"};
  private village_tracts: Array<Object>;

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
      return Number(p['position_id']) == item['position_id'];
    });
    if(_p.length > 0){
      var position = _p[0];
      item['position'] = position['name'];
    } else {
      item['position'] =  {en: "Unknow Position", my: "-", zg: "-"};
    }
    this.navCtrl.push(ProfilePage, {
      staff: item,
      villager: true
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

  public filterStaff(village_code){
    this.staffs = this._staffs.filter(function(v){
      return v['village_code'] == village_code;
    });
  }
  
  public select_village(vt_code){
    //console.log(vt_code);
    let alert = this.alertCtrl.create();
    var _alertTitle = { en: 'Select a village',
                        my:  'ကျေးရွာရွေးချယ်ပါ',
                        zg: 'ေက်းရြာေရြးခ်ယ္ပါ' 
                      };
    alert.setTitle(_alertTitle[this.lang]);
    var villages = this.villages.filter(function(v){
      return v['vt_code'] == vt_code;
    })
    for(var v of villages){  
      var _checked  = false;
      if(this.current_village && (v['village_code'] == (this.current_village)['village_code'])) {
        _checked = true;
      }
      alert.addInput({
        type: 'radio',
        label: (v['name'])[this.lang],
        value: v['village_code'],
        checked: _checked
      });
    }

    alert.addButton('Cancel');
    alert.addButton({
      text: 'OK',
      handler: data => {
        if(data){
          this.filterStaff(data);
          this.DataService.setVillage(data);
          this.current_village = this.DataService.getCurrentVillage();
          this.title = (this.current_village['name'])[this.lang];
        }
      }
    });
    alert.present().then(() => {
      //this.tspSelectOpen = true;
    });
  }

  public select_vt(){
    let alert = this.alertCtrl.create();
    var _alertTitle = { en: 'Select a village tract',
                        my:  'ကျေးရွာအုပ်စုရွေးချယ်ပါ',
                        zg: 'ေက်းရြာအုပ္စုေရြးခ်ယ္ပါ' 
                      };
    alert.setTitle(_alertTitle[this.lang]);
    for(var vts of this.village_tracts){  
      var _checked  = false;
      
      if(this.current_village && (vts['vt_code'] == (this.current_village)['vt_code'])) {
        _checked = true;
      }
      //console.log((vts['name'])['en']);
      alert.addInput({
        type: 'radio',
        label: (vts['name'])[this.lang],
        value: vts['vt_code'],
        checked: _checked
      });
    }

    alert.addButton('Cancel');
    alert.addButton({
      text: 'OK',
      handler: data => {
        //console.log(data);
        if(data){
          this.select_village(data);
        }
      }
    });
    alert.present().then(() => {
      //this.tspSelectOpen = true;
    });
  }

  public choose_location(){
    this.select_vt();
  }

  public load_staff(){
    if(this.current_village && this.current_village['village_code']){
      this.filterStaff(this.current_village['village_code']);
      this.title = (this.current_village['name'])[this.lang];
    }
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad OfficePage');
    this.lang = this.DataService.language();
    this.genderIcon = this.DataService.genderIcon();
    this.positions = this.DataService.getPosition();
    this.village_tracts = this.DataService.getVillge_tracts();
    this.villages = this.DataService.getVillages();
    this.current_village = this.DataService.getCurrentVillage();
    

    this.DataService.table('staffs').getItem('cm')
    .then((result) => {
      this._staffs = result ? <Array<Object>> result : [];
      //this.filterStaff();
      this.load_staff();
    }, (error) => {
      console.log("ERROR: ", error);
    });
  }

}
