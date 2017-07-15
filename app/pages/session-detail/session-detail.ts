import {Component, Input, Output, OnInit, EventEmitter} from '@angular/core';
import {NavParams, Storage, LocalStorage, Alert, NavController, AlertController} from 'ionic-angular';
import {SpeakerDetailPage} from '../speaker-detail/speaker-detail';
import {Device} from 'ionic-native';
import { Star } from './star';
import {TweetShare} from '../../providers/tweet-share';

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
    this.local.get(this.session.name).then((data) => {
      var storedRating = JSON.parse(data);

      if(data){
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
    this.local.set(session.name, JSON.stringify({value: this._rating, comment: this.comment}));

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
    var speakerstring = ""
    for (var speaker of speakers) {
        speakerstring += speaker.twitter + " "
    }
    //window.open(`https://twitter.com/share?text=` + sessionName);
      this.tweetShare.shareViaTwitter("." + speakerstring+" @SUGSA",null,null)
  }


}
