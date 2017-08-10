import { Component } from '@angular/core';
import { PopoverController, ViewController } from 'ionic-angular';
import {ConferenceData} from '../../providers/conference-data';

class PopoverPage {
  constructor(public viewCtrl: ViewController) { }

  close() {
    this.viewCtrl.dismiss();
  }
}

@Component({
  templateUrl: 'build/pages/sponsors/sponsors.html'
})
export class SponsorsPage {
  sponsors: any;
  constructor(public popoverCtrl: PopoverController, confData: ConferenceData) {
    confData.getSponsors().then(sponsors => {
        this.sponsors = sponsors;
    });
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
