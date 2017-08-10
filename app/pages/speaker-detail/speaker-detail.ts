import {Component} from '@angular/core';
import {NavController, NavParams, Page} from 'ionic-angular';
import {SessionDetailPage} from '../session-detail/session-detail';
import {Platform} from 'ionic-angular';

import {TweetShare} from '../../providers/tweet-share';

@Component({
  templateUrl: 'build/pages/speaker-detail/speaker-detail.html'
})
export class SpeakerDetailPage {
  speaker: any;

  constructor(private nav: NavController, private navParams: NavParams, private tweetShare: TweetShare) {

        this.tweetShare = tweetShare;
    this.speaker = this.navParams.data;
  }

  goToSessionDetail(session) {
    this.nav.push(SessionDetailPage, session);
  }

  goToSpeakerTwitter(speaker) {
  //  window.open(`https://twitter.com/${speaker.twitter}`);
    this.tweetShare.shareViaTwitter("."+speaker.twitter+" @AgileAfrica",null,null)
  }

  getSpeakerImage(speaker) {
    var imageName = speaker.profilePic ? speaker.profilePic : "img/speakers/no-image-head.png";
    return imageName;
  }
}
