/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />

import {Component, ViewChild} from '@angular/core';
import {ionicBootstrap, Events, Platform, Nav, MenuController} from 'ionic-angular';
import {StatusBar, Splashscreen} from 'ionic-native';
import {ConferenceData} from './providers/conference-data';
import {UserData} from './providers/user-data';
import {AccountPage} from './pages/account/account';
import {TabsPage} from './pages/tabs/tabs';
import {LoginPage} from './pages/login/login';
import {SignupPage} from './pages/signup/signup';
import {TweetShare} from './providers/tweet-share';
import { SchedulePage } from './pages/schedule/schedule';
import { SpeakerListPage } from './pages/speaker-list/speaker-list';
import { AboutPage } from './pages/about/about';
import {SponsorsPage} from './pages/sponsors/sponsors';

import * as firebase from 'firebase';

interface PageObj {
  title: string;
  component: any;
  icon: string;
  index?: number;
}

@Component({
  templateUrl: 'build/app.html'
})
class ConferenceApp {
  // the root nav is a child of the root app component
  // @ViewChild(Nav) gets a reference to the app's root nav
  @ViewChild(Nav) nav: Nav;

  // List of pages that can be navigated to from the left menu

  appPages: PageObj[] = [
    { title: 'Schedule', component: TabsPage, icon: 'calendar' },
    { title: 'Speakers', component: TabsPage, icon: 'contacts' },
    { title: 'About', component: TabsPage, icon: 'information-circle' },
    { title: 'Sponsors', component: TabsPage, icon: 'ribbon' }
  ];
 rootPage: any;

  constructor(
    public events: Events,
    public userData: UserData,
    public menu: MenuController,
    platform: Platform,
    confData: ConferenceData
  ) {
    var config = {
      apiKey: "AIzaSyByXyIgWx9_jKNEYvnCpglS8tdY912fGRA",
      authDomain: "agile-africa-fa653.firebaseapp.com",
      databaseURL: "https://agile-africa-fa653.firebaseio.com",
      projectId: "agile-africa-fa653",
      storageBucket: "agile-africa-fa653.appspot.com",
      messagingSenderId: "816289217843"
    };

    firebase.initializeApp(config);

    // Call any initial plugins when ready
    platform.ready().then(() => {
      StatusBar.styleDefault();
      confData.load().then(() => {
          console.log('data loaded');
          this.rootPage = TabsPage;
          this.menu.enable(true, 'mainmenu');
          Splashscreen.hide();
      });
    });
  }

  openPage(page: PageObj) {
    // the nav component was found using @ViewChild(Nav)
    // reset the nav to remove previous pages and only have this page
    // we wouldn't want the back button to show in this scenario
    if (page.index) {
      this.nav.setRoot(page.component, {tabIndex: page.index});

    } else {
      this.nav.setRoot(page.component);
    }
  }
}


// Pass the main App component as the first argument
// Pass any providers for your app in the second argument
// Set any config for your app as the third argument, see the docs for
// more ways to configure your app:
// http://ionicframework.com/docs/v2/api/config/Config/
// Place the tabs on the bottom for all platforms
// See the theming docs for the default values:
// http://ionicframework.com/docs/v2/theming/platform-specific-styles/

ionicBootstrap(ConferenceApp, [ConferenceData, UserData, TweetShare], {
  tabbarPlacement: 'bottom',
  prodMode : true
});
