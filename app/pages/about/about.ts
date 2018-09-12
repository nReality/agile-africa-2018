import { Component } from '@angular/core';
import { ConferenceData } from '../../providers/conference-data';
import { PopoverController, ModalController, ViewController, AlertController, NavController } from 'ionic-angular';
import { Feedback } from '../feedback/feedback';

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
  constructor(public modalCtrl: ModalController, public nav: NavController, public alertCtrl: AlertController, public popoverCtrl: PopoverController, conferenceData: ConferenceData) {
    this.about = conferenceData.data.about;
    this.name = conferenceData.data.name;
  }

  presentPopover(event) {
    const popover = this.popoverCtrl.create(PopoverPage);
    popover.present({ ev: event });
  }

  openPagInNewWindow(link) {
    window.open(link, "_system", "location=yes");
    return false;
  }

  goToFeedbackPage() {
    this.nav.push(Feedback);
  }
}
