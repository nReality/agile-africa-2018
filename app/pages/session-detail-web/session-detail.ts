import {Component} from '@angular/core';
import {NavParams, ViewController} from 'ionic-angular';

@Component({
  templateUrl: 'build/pages/session-detail-web/session-detail.html',

})
export class SessionDetailWebPage {
  session: any;

  constructor(private viewCtrl: ViewController, private navParams: NavParams) {
    this.session = navParams.data;
  }

  close() {
    this.viewCtrl.dismiss();
}
}
