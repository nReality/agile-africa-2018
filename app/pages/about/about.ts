import { Component, Input } from '@angular/core';
import { ConferenceData } from '../../providers/conference-data';
import { PopoverController, ViewController, AlertController, Storage, LocalStorage } from 'ionic-angular';
import { Device } from 'ionic-native';

import * as firebase from 'firebase';

@Component({
  template: `
    <ion-list>
      <button ion-item (click)="close()">Learn Ionic</button>
      <button ion-item (click)="close()">Documentation</button>
      <button ion-item (click)="close()">Showcase</button>
      <button ion-item (click)="close()">GitHub Repo</button>
    </ion-list>
  `
})
class PopoverPage {

  constructor(public viewCtrl: ViewController) { }

  close() {
    this.viewCtrl.dismiss();
  }
}

@Component({
  templateUrl: 'build/pages/about/about.html'
})
export class AboutPage {
  about: any;
  name: string;
  local: any;
  @Input() answers: any = {};
  constructor(public alertCtrl: AlertController, public popoverCtrl: PopoverController, conferenceData: ConferenceData) {
    this.about = conferenceData.data.about;
    this.name = conferenceData.data.name;
    this.initializeStorage();
    this.restoreFeedback();
  }

  initializeStorage(){
    this.local = new Storage(LocalStorage);
  }

  restoreFeedback(){
    this.local.get('feedback').then((data) => {
      const storedFeedback = JSON.parse(data);
      if(data) {
        this.answers = storedFeedback;
      }
    });
  }

  presentPopover(event) {
    const popover = this.popoverCtrl.create(PopoverPage);
    popover.present({ ev: event });
  }

  openPagInNewWindow(link) {
    window.open(link, "_system", "location=yes");
    return false;
  }

  submitFeedback(answers) {
    const deviceId = Device.device.uuid || Date.now();
    firebase.database().ref('Feedback/' + deviceId).set(answers);
    this.local.set('feedback', JSON.stringify(answers));
    this.showSuccess();
  }

  showSuccess(){
    const alert = this.alertCtrl.create({
      title: 'Thank you!',
      message: 'Your feedback has been submitted.',
      buttons: ['OK']
    });
    alert.present();
  }

  disableButton(answers) {
    const values = Object.keys(answers).map(answer => answers[answer]);
    return values.length === 5 && values.indexOf('') === -1 ? false : true;
  }

}
