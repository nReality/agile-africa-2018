import { Component } from '@angular/core';
import { ConferenceData } from '../../providers/conference-data';
import { PopoverController, ViewController } from 'ionic-angular';


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

  constructor(public popoverCtrl: PopoverController, conferenceData: ConferenceData) {
    this.about = conferenceData.data.about;
    this.name = conferenceData.data.name;
  }

  presentPopover(event) {
    let popover = this.popoverCtrl.create(PopoverPage);
    popover.present({ ev: event });
  }

  openPagInNewWindow(link) {
      window.open(link, "_system", "location=yes");
      return false;
  }
}
