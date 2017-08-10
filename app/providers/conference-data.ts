import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {UserData} from './user-data';


@Injectable()
export class ConferenceData {
  data: any;

  constructor(private http: Http, private user: UserData) { }

  load() {
    if (this.data) {
      // already loaded data
      return Promise.resolve(this.data);
    }

    // don't have the data yet
    return new Promise(resolve => {
        this.user.getConferenceData().then(conferenceData => {
            if (!conferenceData) {
                this.downloadData(resolve);
                return;
            }
            this.downloadData(resolve, JSON.parse(conferenceData));
        });
    });
  }

  downloadData(resolve: Function, oldConferenceData?:any) {
      if (oldConferenceData) {
          this.data = this.processData(oldConferenceData);
          resolve(this.data);
      }

      let fallback = () => {
          if (oldConferenceData) {
              return;
          }

          console.log('loading failed, loading local data');
          this.http.get('data/data.json').subscribe(res => {
              this.processResponse(res, 'offline', resolve);
          });
      }

      this.http.get('https://api.github.com/repos/nreality/agile-africa-2017/git/refs/heads/master')
      .subscribe(res => {
        let result = res.json();
        console.log(result);
        let latestCommit = result.object.sha;

        if (oldConferenceData && latestCommit === oldConferenceData.version) {
            console.log('data still fine, using saved data');
        } else {
            console.log('data outdated, loading new');
            this.http.get('https://raw.githubusercontent.com/nReality/agile-africa-2017/' + latestCommit +'/www/data/data.json').subscribe(res => {
              this.processResponse(res, latestCommit, resolve);
          }, fallback);
        }
    }, fallback);
  }



  processResponse(response: any, version: string, resolve: Function) {
      let conferenceData = response.json();
      conferenceData.version = version;
      this.user.saveConferenceData(conferenceData);
      this.data = this.processData(conferenceData);
      resolve(this.data);
  }

  processData(data) {
    // just some good 'ol JS fun with objects and arrays
    // build up the data by linking speakers to sessions

    data.tracks = [];
    data.locations = [];
    data.flatGroups = [];
    data.sponsors = data.sponsors;

    // loop through each day in the schedule
    data.schedule.forEach(day => {
      // loop through each timeline group in the day
      day.groups.forEach(group => {
        data.flatGroups.push(group);

        // loop through each session in the timeline group
        group.sessions.forEach(session => {
          this.processSession(data, session, day.date);
        });
      });
    });

    data.locationMappings.forEach(location => {
      data.locations.push(location);
    });

    return data;
  }
  processSession(data, session, date) {

    this.user.checkIfLocalfavourite(session.name);
    var locationArray = data.locationMappings.filter(function(obj) {return obj.id == session.locationId});
    if (!locationArray.length) {
      console.log(session.locationId);
    }
    session.locationName = locationArray? locationArray[0].name : null;
    session.location = locationArray? locationArray[0] : null;
    session.date = date
    // loop through each speaker and load the speaker data
    // using the speaker name as the key
    session.speakers = [];
    if (session.speakerNames) {
      session.speakerNames.forEach(speakerName => {
        let speaker = data.speakers.find(s => s.name === speakerName);
        if (speaker) {
          session.speakers.push(speaker);
          speaker.sessions = speaker.sessions || [];
          speaker.sessions.push(session);
        }
      });
    }

    if (session.tracks) {
      session.tracks.forEach(track => {
        if (data.tracks.indexOf(track) < 0) {
          data.tracks.push(track);
        }
      });
    }
  }

  getTimeline(dayIndex, queryText = '', excludeTracks = [], excludeLocations = [], excludeDays = [], segment = 'all') {

    return this.load().then(data => {
      let days = [];
      let daySessions = [];

      data.schedule.forEach(day => {
        day.shownSessions = 0;
        day.hide = false;
        queryText = queryText.toLowerCase().replace(/,|\.|-/g, ' ');
        let queryWords = queryText.split(' ').filter(w => !!w.trim().length);

        day.groups.forEach(group => {
          group.hide = true;

          group.sessions.forEach(session => {
            // check if this session should show or not
            this.filterSession(session, queryWords, excludeTracks, excludeLocations, excludeDays, segment);
            if (!session.hide) {
              // if this session is not hidden then this group should show
              group.hide = false;
              if (daySessions.indexOf(group) == -1) {
                daySessions.push(group);
                day.shownSessions++;
              }
            }
          });
        });
        if(day.shownSessions !== 0)
          days.push(day);
      });

      return days;
    });
  }

  getLocationName(locationId){
    var locationArray = this.data.locationMappings.filter(function(obj) {return obj.id == locationId});
    return locationArray? locationArray[0].name : null;
  }


  filterSession(session, queryWords, excludeTracks, excludeLocations, excludeDays, segment) {
    let matchesQueryText = false;
    if (queryWords.length) {
      // of any query word is in the session name than it passes the query test
      queryWords.forEach(queryWord => {
        if (session.name.toLowerCase().indexOf(queryWord) > -1) {
          matchesQueryText = true;
        }

        if (session.locationId != null && this.getLocationName(session.locationId).toLowerCase().indexOf(queryWord) > -1) {
          matchesQueryText = true;
        }

        if (session.date != null && session.date.toLowerCase().indexOf(queryWord) > -1) {
          matchesQueryText = true;
        }

        session.speakers.forEach(speaker => {
          if (speaker.name != null && speaker.name.toLowerCase().indexOf(queryWord) > -1) {
            matchesQueryText = true;
          }
        });

      });
    } else {
      // if there are no query words then this session passes the query test
      matchesQueryText = true;
    }


    // if any of the sessions tracks are not in the
    // exclude tracks then this session passes the track test
    let matchesTracks = false;
    session.tracks.forEach(trackName => {
      if (excludeTracks.indexOf(trackName) === -1) {
        matchesTracks = true;
      }
    });

    let matchesLocation = false;
    if (session.locationId != null && excludeLocations.indexOf(session.locationId) === -1) {
      matchesLocation = true;
    }

    let matchesDay = false;
    if (session.date != null && excludeDays.indexOf(session.date) === -1) {
      matchesDay = true;
    }


    // if the segement is 'favorites', but session is not a user favorite
    // then this session does not pass the segment test
    let matchesSegment = false;
    if (segment === 'favorites') {
      if (this.user.hasFavorite(session.name)) {
        matchesSegment = true;
      }
    } else {
      matchesSegment = true;
    }

    // all tests must be true if it should not be hidden
    session.hide = !(matchesQueryText && matchesTracks && matchesSegment && matchesDay && matchesLocation);
  }

  getSpeakers() {
    return this.load().then(data => {
      return data.speakers.sort((a, b) => {
        var aPriority = 9999;
        if (a.priority != null) {
          aPriority = a.priority;
        }
        var bPriority = 9999;
        if (b.priority != null) {
          bPriority = b.priority;
        }

        if (aPriority != bPriority) {
          return aPriority - bPriority;
        }


        let aName = a.name.split(' ').shift();
        let bName = b.name.split(' ').shift();
        return aName.localeCompare(bName);
      });
    });
  }

  getTracks() {
    return this.load().then(data => {
      return data.tracks.sort();
    });
  }

  getLocations() {
    return this.load().then(data => {
      return data.locationMappings;
    });
  }

  getMap() {
    return this.load().then(data => {
      return data.map;
    });
  }

  getSponsors() {
    return this.load().then(data => {
        return data.sponsors;
    });
  }
}
