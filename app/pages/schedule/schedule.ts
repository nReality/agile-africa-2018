import { Component, ViewChild } from '@angular/core';

import { Content, AlertController, App, ItemSliding, List, ModalController, LocalStorage, Storage, NavController } from 'ionic-angular';

import { ConferenceData } from '../../providers/conference-data';
import { ScheduleFilterPage } from '../schedule-filter/schedule-filter';
import { SessionDetailPage } from '../session-detail/session-detail';
import { UserData } from '../../providers/user-data';


@Component({
  templateUrl: 'build/pages/schedule/schedule.html'
})
export class SchedulePage {
  // the list is a child of the schedule page
  // @ViewChild('scheduleList') gets a reference to the list
  // with the variable #scheduleList, `read: List` tells it to return
  // the List and not a reference to the element
  @ViewChild('scheduleList', {read: List}) scheduleList: List;
  @ViewChild(Content) content: Content;

  dayIndex = 0;

  queryText = '';
  segment = 'all';
  excludeTracks = [];
  excludeLocations = [];
  locations: Array<{name: string, id: string, hide: boolean, color: string}> = [];
  excludeDays = [];
  days = [];
  storage : Storage;

  constructor(
    public alertCtrl: AlertController,
    public app: App,
    public modalCtrl: ModalController,
    public navCtrl: NavController,
    public confData: ConferenceData,
    public user: UserData
  ) {

    this.confData.data.locations.forEach(location => {
          this.locations.push({
            name: location.name,
            id: location.id,
            hide: false,
            color: location.color
          });
    });
   this.storage = new Storage(LocalStorage);
  }

  toggleFavourites(){
    if (this.segment == "all")
      this.segment= "favorites";
    else
      this.segment = "all"
    this.updateSchedule();

  }

  toggleLocation(locationId){
    this.excludeLocations = [];
    this.locations.forEach(location => {
      if (location.id == locationId){
        location.hide = !location.hide;
      }
      if (location.hide){
        this.excludeLocations.push(location.id);
      }
    });
    this.updateSchedule();
  }


  toggleDay(dateString){
    this.excludeDays = [];
    this.confData.data.schedule.forEach(day => {
      if (day.date == dateString){
        day.hide = !day.hide;
      }
      if (day.hide){
        this.excludeDays.push(day.date);
      }
    });
    this.updateSchedule();
  }
  ionViewDidEnter() {
    this.app.setTitle('Schedule');
  }

  ngAfterViewInit() {
    this.updateSchedule();
    let self = this;

    self.storage.get("scrollTop").then((scrollTop) => {
      if (scrollTop){
        this.content.scrollTo(0, scrollTop, 500)
      }
    });

    this.content.addScrollListener(function(event) {
      self.storage.set("scrollTop", event.target.scrollTop);
    });
  }


  updateSchedule() {
    // Close any open sliding items when the schedule updates
    this.scheduleList && this.scheduleList.closeSlidingItems();

    this.confData.getTimeline(this.dayIndex, this.queryText, this.excludeTracks, this.excludeLocations, this.excludeDays, this.segment).then(data => {
      this.days = data;
    });
  }

  presentFilter() {
    let modal = this.modalCtrl.create(ScheduleFilterPage, this.excludeTracks);
    modal.present();

    modal.onDidDismiss((data: any[]) => {
      if (data) {
        this.excludeTracks = data;
        this.updateSchedule();
      }
    });

  }

  goToSessionDetail(sessionData) {
    // go to the session detail page
    // and pass in the session data
    this.navCtrl.push(SessionDetailPage, sessionData);
  }

  isFavourite(sessionData){
    return this.user.hasFavorite(sessionData.name);
  }
  addFavorite(sessionData) {
    this.user.addFavorite(sessionData.name);
  }

  removeFavorite(sessionData) {
    this.user.removeFavorite(sessionData.name);
  }

  locationNoSpaces(location){
    return (!location) ? '' : location.replace(/ /g, '');
  }

  checkIfTimeHasPassed(day, groupTime){
    let index = day.indexOf("-") + 1;
    let dayString = day.substring(index, day.length);
    let dateTimeString = "2016" + dayString + groupTime;
    if(Date.now() > Date.parse(dateTimeString))
      return "group-passed";

    return "time-group";
  }

  getLocationName(locationId){
    return this.confData.getLocationName(locationId);
  }

  getColor(location) {
    return location.hide ? "white" : location.color;
  }
}
