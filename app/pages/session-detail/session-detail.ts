import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NavParams, Storage, LocalStorage, Alert, NavController, AlertController } from 'ionic-angular';
import { SpeakerDetailPage } from '../speaker-detail/speaker-detail';
import { Device } from 'ionic-native';
import { Star } from './star';
import { TweetShare } from '../../providers/tweet-share';

import * as firebase from 'firebase';

@Component({
  templateUrl: 'build/pages/session-detail/session-detail.html',
  directives: [Star]
})
export class SessionDetailPage {
  alert: Alert;
  session: any;
  stars: number[] = [1,2,3,4,5];
  comment: string = "";
  local: any;
  nav: NavController = null;

  @Input() rating: number = 0;
  @Output() rate = new EventEmitter();
  _rating = this.rating;

  constructor(public alertCtrl: AlertController, private navParams: NavParams, nav: NavController, private tweetShare: TweetShare) {
    this.tweetShare = tweetShare;
    this.session = navParams.data;
    this.nav = nav;
    this.initializeStorage();
    this.restoreState();
  }

  initializeStorage(){
    this.local = new Storage(LocalStorage);
  }

  restoreState(){
    this.local.get(this.session.name + '-rating').then((data) => {
      var storedRating = JSON.parse(data);

      if(data) {
        this.onRate(storedRating.value);
        this.comment = storedRating.comment;
      }
    });
  }

  onRate(star) {
    this.rate.emit(star);
    this._rating = star;
  }

  postRating(session){
    var deviceId = Device.device.uuid || Date.now();
    firebase.database().ref(session.name + '/' + deviceId).set({value: this._rating, comment:(this.comment || "")});
    this.local.set(session.name + '-rating', JSON.stringify({value: this._rating, comment: this.comment}));

    this.showSuccess();
  }

  showSuccess(){
    let alert = this.alertCtrl.create({
      title: 'Thank you!',
      message: 'Your feedback has been received.',
      buttons: ['OK']
    });

    alert.present();
  }

  goToSpeakerDetail(speakerName: string) {
    this.nav.push(SpeakerDetailPage, speakerName);
  }

  goToTwitter(speakers) {
    let speakerstring = this.getTwitterString(speakers);
    this.tweetShare.shareViaTwitter("." + speakerstring+" @AgileAfricaConf",null,null)
  }

  hasTwitterAccounts(speakers) {
    let speakerstring = this.getTwitterString(speakers);
    return speakerstring.replace(/undefined/g, "").trim() || false;
  }

  getTwitterString(speakers) {
    var speakerstring = ""
    for (var speaker of speakers) {
        speakerstring += speaker.twitter + " "
    }
    return speakerstring;
  }

  getSpeakerImage(speaker) {
    var imageName = speaker.profilePic ? speaker.profilePic : "img/speakers/no-image-head.png";
    return imageName;
  }

}
