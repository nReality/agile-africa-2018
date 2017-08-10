import { Injectable } from '@angular/core';

import { Events, LocalStorage, Storage } from 'ionic-angular';


@Injectable()
export class UserData {
  _favorites = [];
  HAS_LOGGED_IN = 'hasLoggedIn';
  storage = new Storage(LocalStorage);

  constructor(public events: Events) {}

  checkIfLocalfavourite(sessionName){
    this.storage.get(sessionName).then((found) => {
      if(found)
        this.addFavorite(sessionName);
    });
  }

  hasFavorite(sessionName) {
    return (this._favorites.indexOf(sessionName) > -1);
  }

  addFavorite(sessionName) {
    if (!this.hasFavorite(sessionName)){
        this._favorites.push(sessionName);
        this.storage.set(sessionName, true);
    }
  }

  removeFavorite(sessionName) {
    let index = this._favorites.indexOf(sessionName);
    if (index > -1) {
      this._favorites.splice(index, 1);
      this.storage.remove(sessionName);
    }
  }

  login(username) {
    this.storage.set(this.HAS_LOGGED_IN, true);
    this.setUsername(username);
    this.events.publish('user:login');
  }

  signup(username) {
    this.storage.set(this.HAS_LOGGED_IN, true);
    this.setUsername(username);
    this.events.publish('user:signup');
  }

  logout() {
    this.storage.remove(this.HAS_LOGGED_IN);
    this.storage.remove('username');
    this.events.publish('user:logout');
  }

  setUsername(username) {
    this.storage.set('username', username);
  }

  getUsername() {
    return this.storage.get('username').then((value) => {
      return value;
    });
  }

  saveConferenceData(data) {
      this.storage.set('conference-data', JSON.stringify(data));
  }

  getConferenceData() {
      return this.storage.get('conference-data');
  }

  // return a promise
  hasLoggedIn() {
    return this.storage.get(this.HAS_LOGGED_IN).then((value) => {
      return value;
    });
  }
}
