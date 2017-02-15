import { Component } from '@angular/core';
import { NavController, NavParams, AlertController, App, ViewController, LoadingController } from 'ionic-angular';
import {Http} from '@angular/http';
import 'rxjs/add/operator/retry';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/map';
import { DataService } from '../../providers/data-service';
import { HomePage } from '../home/home';

@Component({
  selector: 'page-settings',
  templateUrl: 'settings.html'
})


export class SettingsPage {

  tspSelectOpen: boolean;
  tspSelectResult;
  _setting = {host:'192.168.1.100', port: 80, lang: 'en', downloaded: true, village: {}};
  _lbl = [
    {en: 'Language', my: 'ဘာသာစကား', zg: 'ဘာသာစကား'},
    {en: 'English', my: 'မြန်မာ', zg: "ဗမာ"}];


  private unicodeRender : boolean = false;
  private percent : number = 0;
  private percent_vl : number = 0;
  
  constructor(  public navCtrl: NavController, 
                public navParams: NavParams,
                public alertCtrl: AlertController,
                private http: Http, 
                private DataService: DataService,
                public viewCtrl: ViewController,
                public appCtrl: App,
                public loadingController: LoadingController
  ) {}

  public get_url(){
    //var post_data = JSON.stringify({data: null});
    //var headers = new Headers();
    var host = (this._setting.host || "192.168.1.100") ;
    var port = (this._setting.port || 80);
    var download_url = "http://" + host + ":" + port + "/mis_y4/rest/download_data/";
    return download_url;
  }

  public do_download(table,township_code){
    this.http.get(this.get_url()+"?tablename="+table.name)
    .timeout(5000).map(res => res.json())
    .subscribe(data => {
      //this.posts = data[table];
      //console.log(data[tablename]);
      var tbl_name= this.DataService.table(table.name); 
      // var tbl_name = localforage.createInstance({
      //     name: "CDD-Assistant",
      //     storeName : table.name
      // });

      if(table.tsp){
        var _data = data[table.name].filter(function(v){
          return v.township_code == township_code;
        })
      } else {
        var _data = data[table.name];
      }
        
      var __data = [];
      for(var v of _data){

        var _v = {};

        for(var k of table.filed){
          _v[k] = v[k];
        }

        _v['name'] = {  en: v[(table.nameField+'english')],
                        my: this.DataService.z2u(v[(table.nameField+'myanmar')]),
                        zg: v[(table.nameField+'myanmar')]
                    }; 
        __data.push(_v);
      }

      tbl_name.setItem(table.name, __data).then(function(res){
        //console.log(res);
        return true;
    }).catch(function(err){
        console.log(err);
        return false;
      });
    }, (err) => {
      console.log(err);
      this.alertError(err);
    });
  }

  public download_vl(township_code){
    var tables = [  { name: 'vl_positions', nameField: 'position_name_', tsp: false,
                      filed: ['position_id', 'position_type', 'position_for'] 
                    },

                    { name: 'village_tracts', nameField: 'vt_name_', tsp: true,
                      filed: ['state_code', 'township_code', 'vt_code', 'latitude', 'longitude'] 
                    } , 
                    { name: 'villages', nameField: 'village_name_', tsp: true,
                      filed: ['state_code', 'township_code', 'vt_code', 'village_code', 'latitude', 'longitude'] 
                    }
                  ];
    var base = tables.length;
    var time = 1;
    this.percent_vl = 1;
    for (var table of tables) {
      this.do_download(table,township_code);
      this.percent_vl =  Number((time / base * 100).toFixed(2));
      time++;
      if(this.percent_vl >= 100){
        this.download_staff(township_code);
      }
    }
  }

  public downloadCompleteHandler(percent){
    if(percent >= 100){
      this._setting.downloaded = true;
      this.applySetting(false);
      //this.navCtrl.pop(); 
      this.appCtrl.getRootNav().push(HomePage);
      this.viewCtrl.dismiss();
    } else {
      
    }
    this.percent = percent;
  }

  public download_staff(township_code){
    this.http.get(this.get_url()+"?tablename=staffs")
    .timeout(10000).map(res => res.json())
    .subscribe(data => {
      var _staff = {cf:[], tf:[], cm:[], office:[]};
      var time = 1;
      var base = data.staffs.length;
      var percent = 0;
      var _percent = 10;
      //console.log(data.staffs);
      var _staffs = data.staffs.filter(function(v){
        return v.township_code == township_code;
      });
      var list = [  'cftf_id', 'state_code', 'township_code', 'vt_code', 'village_code', 'gender',
                    'staff_code', 'notes', 'age', 'ethnic_id', 'position_id', 'subposition_id', 
                    'staff_type', 'father_name', 'nrc_no', 'dob', 'record_status'];
      var nameList = ['staffname', 'position_other', 'address', 'contactperson'];
      
      var contact_list = ['mobileph', 'email', 'contactph'];

      for(var v of _staffs){
        var staff = {};

        for(var k of contact_list){
          if(v[k] && v[k].length > 3){
            staff[k] = v[k];
          } else {
            staff[k] = '';
          }
        } 

        for(var k of list){
          staff[k] = v[k];
        } 

        for(var k of nameList){
          staff[k] = {  en: this.DataService.z2u(v[k]),
                        my: this.DataService.z2u(v[k]),
                        zg: v[k]
                      };
        }
        if(staff['gender'] == 'Male')   staff['gender'] = 1;
        if(staff['gender'] == 'Female') staff['gender'] = 2;
        if(!staff['subposition_id'] || staff['subposition_id'] > 23) staff['subposition_id'] = 0;
        if(!staff['position_id'] || staff['position_id'] > 23) staff['subposition_id'] = 0;

        if(staff['staff_type'] == "v" || staff['staff_type'] == "V"){
          _staff.cm.push(staff);
        } else if((staff['staff_type'] == "S" || staff['staff_type'] == "s") ) {
          //console.log(staff);
          if(staff['position_id'] == 6){
              _staff.tf.push(staff);
          } else if(staff['position_id'] == 7){
              _staff.cf.push(staff);
          } else {
              _staff.office.push(staff);
          }
        }
        percent =  Number((time / base * 100).toFixed(2));
        //console.log(this.percent);
        time++;
        if(percent >= _percent){
          _percent += 10;
          this.downloadCompleteHandler(percent);
        }
        if(percent >= 100){
          var tbl_staffs = this.DataService.table('staffs');
          // var tbl_staffs = localforage.createInstance({
          //     name: "CDD-Assistant",
          //     storeName : 'staffs'
          // });
          var stores = ['cf', 'tf', 'cm', 'office'];
          for(var k of  stores){
            var value = _staff[k].filter(function(v){
              return (!v['record_status'] || v['record_status'] != "N");
            });

            
            if(k == 'office'){
              value = value.sort((n1,n2) => {
                      if (Number(n1.subposition_id) > Number(n2.subposition_id)) { return 1; }
                      if (Number(n1.subposition_id) < Number(n2.subposition_id)) { return -1; }
                      return 0;
                    });
            } else if(k == 'cm'){
              value = value.sort((n1,n2) => {
                      if (Number(n1.subposition_id) > Number(n2.subposition_id)) { return 1; }
                      if (Number(n1.subposition_id) < Number(n2.subposition_id)) { return -1; }
                      return 0;
                    });
            } 
            

            tbl_staffs.setItem(k, value).then(function(res){
              //console.log(res);
            }).catch(function(err){
              console.log(err);
            });
          }
          this.DataService.pre_loading();
            
          //console.log(_staff);
        }
      }
    }, (err) => {
      console.log(err);
      this.alertError(err);
    });
  }
  
  public selectTownship() {
    this.percent = 0;
    this.http.get(this.get_url()+"?tablename=townships")
    .timeout(10000).map(res => res.json())
    .subscribe(data => {

      var tbl_tsp = this.DataService.table('townships');
      // var tbl_tsp = localforage.createInstance({
      //     name: "CDD-Assistant",
      //     storeName : 'townships'
      // });
      var _t = [];
      for(var t of  data.townships){
        _t.push({ township_code: t.township_code,
                  name: { en: t.township_name_english,
                          my: this.DataService.z2u(t.township_name_myanmar),
                          zg: t.township_name_myanmar}
                  });
      }
      tbl_tsp.setItem('townships', _t).then(function(res){
          //console.log(res);
        }).catch(function(err){
          console.log(err);
        });
      if(_t.length > 1 ){
        var alert = this.alertCtrl.create();
        var _alertTitle = { en: 'Select your Township',
                            my:  'မြို့နယ်ရွေးချယ်ပါ',
                            zg: 'ၿမိဳ႕နယ္ေရြးခ်ယ္ပါ' 
                          };
        alert.setTitle(_alertTitle[this._setting.lang]);
        for(var tsp of _t){  
          alert.addInput({
            type: 'radio',
            label: tsp.name[this._setting.lang],
            value: tsp.township_code,
            //checked: true
          });
        }

        alert.addButton('Cancel');
        alert.addButton({
          text: 'OK',
          handler: data => {
            this.tspSelectOpen = false;
            this.tspSelectResult = data;
            //console.log(this.tspSelectResult);
            this.download_vl(data);
          }
        });
        alert.present().then(() => {
          //this.tspSelectOpen = true;
        });
      } else {
        this.download_vl(_t[0].township_code);
      }
    }, (err) => {
      console.log(err);
      this.alertError(err);
    });
    
  }

  public alertError(error){
    if(error){
      var alert = this.alertCtrl.create({
        title: 'Error!',
        subTitle: error,
        buttons: ['OK']
      });
      alert.present();
    }
  }

  public download() {
    var loader = this.loadingController.create({
      content: "Connection to Server",
      duration: 5000
    });  
    loader.present();
    this.http.get(this.get_url()+"check.php")
    .timeout(5000).map(res => res.text())
    .subscribe(data => {
      //this.posts = data.data.children;
      if(data == 'ready'){
          this.selectTownship();
      } else {
          console.log(data);
          this.alertError(data);
      }
    }, (err) => {
        console.log(err);
        this.alertError(err);
    },() =>{
      loader.dismiss();
    });
  }

  public applySetting(_alert) {
    this.DataService.setSetting(this._setting);
    if(_alert){
      var alert = this.alertCtrl.create({
        title: 'Succes',
        subTitle: 'Apply Successed!',
        buttons: ['OK']
      });
      alert.present();
    }
  }

  ionViewDidLoad() {
    //console.log('ionViewDidLoad SettingsPage');
    this._setting.host = this.DataService.getSetting().host;
    this._setting.port = this.DataService.getSetting().port;
    this._setting.lang = this.DataService.getSetting().lang;
    this._setting.downloaded = this.DataService.getSetting().downloaded;
  }


  ngAfterViewInit(){
    var _u = document.getElementById("u").offsetWidth;
    var _uu = document.getElementById("uu").offsetWidth ;
    if(_uu >= (_u * 3/2 )){
      this.unicodeRender = false;
    } else {
      this.unicodeRender = true;
    }
     //this.checkFont();
  }
}
