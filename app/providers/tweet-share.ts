import { Injectable } from '@angular/core';
import { Platform } from 'ionic-angular';

@Injectable()
export class TweetShare {
  
  constructor(private platform: Platform) {
          this.platform = platform;
        }

  shareViaTwitter(message, image, link) {
    var pl = (<any>window).plugins
    if (pl == null){
       window.open(`https://twitter.com/intent/tweet?text=` + message);
      return;
    }
      this.platform.ready().then(() => {
          if(pl.socialsharing) {
            try{
              //for some reason the check always fails
              //pl.socialsharing.canShareVia("twitter", message, null, image, link, function(result) {
                  pl.socialsharing.shareViaTwitter(message, image, link);
              //}, function(error) {
              //    console.error(error);
              //});
            }catch(error){
                console.error(error);
            }

          }
      });
  }
}
