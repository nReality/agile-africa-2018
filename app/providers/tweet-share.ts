import { Injectable } from '@angular/core';
import { Platform }   from 'ionic-angular';
import { SocialSharing } from 'ionic-native';

@Injectable()
export class TweetShare {
  constructor(private platform: Platform, private socialSharing: SocialSharing) {
    this.platform = platform;
    this.socialSharing = socialSharing;
  }

  shareViaTwitterWithSpeakerAndConference(message, speakers: Array<any>) {
    var speakerstring = ""
    for (var speaker of speakers) {
      if (speaker.twitter !== '@someone') {
        speakerstring += " " + speaker.twitter;
      } else {
        speakerstring += " " + speaker.name;
      }
    }
    this.shareViaTwitterWithConference(message + speakerstring);
  }

  shareViaTwitterWithConference(message) {
    this.shareViaTwitter(message + ' @AgileAfrica', null, null)
  }

  shareViaTwitter(message, image, link) {
    this.platform.ready().then(() => {
      if (SocialSharing) {
        try {
          SocialSharing.shareViaTwitter(message, image, link)
            .then(() => {})
            .catch((err) =>{
            console.error(err);
            if (err !== 'cancelled'){
              window.open(`https://twitter.com/intent/tweet?text=` + message);
            }
          });;
        } catch(error) {
          console.error(error);
        }
      }
    });
  }
}
