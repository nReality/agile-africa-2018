import { Component, Input } from '@angular/core';
import { ConferenceData } from '../../providers/conference-data';
import { AlertController, Storage, LocalStorage, NavController } from 'ionic-angular';
import { Device } from 'ionic-native';

import * as firebase from 'firebase';

@Component({
  templateUrl: 'build/pages/feedback/feedback.html'
})
export class Feedback {
  local: any;  
  questions: any;
  @Input() answers: any = {};
  constructor(public alertCtrl: AlertController, conferenceData: ConferenceData, public nav: NavController) { 
    this.questions = conferenceData.data.about.questions;
    this.answers = [];
    this.initializeStorage();
    this.restoreFeedback();
  }

  initializeStorage(){
    this.local = new Storage(LocalStorage);
  }
    
  restoreFeedback(){
    this.local.get('feedback').then((data) => {
      const storedFeedback = JSON.parse(data);
      if(data) { this.answers = storedFeedback; }
    });
  }

  submitFeedback(answers) {
    const deviceId = Device.device.uuid || Date.now();
    firebase.database().ref('Feedback/' + deviceId).set(answers);
    this.local.set('feedback', JSON.stringify(answers));
    this.showSuccess();
    this.nav.pop();
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