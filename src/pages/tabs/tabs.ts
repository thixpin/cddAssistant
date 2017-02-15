import { Component } from '@angular/core';

import { OfficePage } from '../office/office';
import { TfPage } from '../tf/tf';
import { CfPage } from '../cf/cf';
import { CmPage } from '../cm/cm';

@Component({
  templateUrl: 'tabs.html'
})
export class TabsPage {
  // this tells the tabs component which Pages
  // should be each tab's root Page
  tab1Root: any = OfficePage;
  tab2Root: any = TfPage;
  tab3Root: any = CfPage;
  tab4Root: any = CmPage;

  constructor() {

  }
}
