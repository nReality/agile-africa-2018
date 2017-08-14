const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const imageFolderPath = "downloads/";
const adminAjaxUrl = 'http://2017.agileafricaconf.com/wp-admin/admin-ajax.php';
const util = require('util');
var he = require('he');

function loadschedule() {
  request.post(adminAjaxUrl, {
    form: {
      action: "get_schedule"
    }
  }, scheduleLoaded);
}

function scheduleLoaded(error, response, body) {
  if (error) {
    return console.error('Fialed to load schedule: ', error);
  }
  const sessions = JSON.parse(body).sessions;
  console.log(sessions);
  var completedSessions = [];

  function loadNextSession() {
    const session = sessions.pop();
    if (!session) {
      mapCompletedSessions(completedSessions);
      return console.log('done.');
    }

    loadSessionDetail(session, function(err, sessionDetail) {
      if (err) {
        return console.error(err);
      }

      sessionDetail.name = he.decode(sessionDetail.post_title);
      sessionDetail.locationId = mapLocation(sessionDetail.location);
      sessionDetail.timeStart = sessionDetail.time;
      sessionDetail.timeEnd = sessionDetail.end_time;
      sessionDetail.tracks = [sessionDetail.locationId];
      sessionDetail.speakerNames = sessionDetail.speakers.map(function(speaker) {
        return speaker.name;
      });

      delete sessionDetail.post_title;
      delete sessionDetail.url;
      delete sessionDetail.time;
      delete sessionDetail.end_time;
      delete sessionDetail.location;
      delete sessionDetail.color;

      completedSessions.push(sessionDetail);
      loadNextSession();
    });
  }
  loadNextSession();
}

function loadSessionDetail(session, done) {
  console.log('loading session: ', session.post_title);
  request(session.url, sessionDetailPageLoaded);

  function sessionDetailPageLoaded(err, response, body) {
    if (err) {
      done('failed to load session detail for: ', session.url);
    }

    const $ = cheerio.load(body);
    var paragraphs = $(".container > .row > .col-md-8 > p");
    var joinedLines = joinParagraphs(paragraphs, $);
    session.description = joinedLines === "" ? "No Description" : joinedLines;
    loadSpeakers(session, done);
  }
}

function loadSpeakers(session, done) {
  var loadedSpeakers = [];
  function loadNextSpeaker() {
    var speaker = session.speakers.pop();
    if (!speaker) {
      session.speakers = loadedSpeakers;
      return done(null, session);
    }
    loadSpeakerDetail(speaker, function(err, loadedSpeaker) {
      loadedSpeakers.push(loadedSpeaker);
      loadNextSpeaker();
    });
  }
  loadNextSpeaker();
}

function loadSpeakerDetail(speaker, done) {
  request(speaker.url, speakerLoaded);
  function speakerLoaded(err, response, body) {
    const $ = cheerio.load(body);
    var paragraphs = $(".container > p");
    var joinedLines = joinParagraphs(paragraphs, $);

    speaker.about = joinedLines === "" ? "No About" : joinedLines.replace("View full schedule", "");
    speaker.name = speaker.post_title;
    speaker.priority = 1;

    delete speaker.featured;
    delete speaker.post_title;
    delete speaker.url;
    delete speaker.post_image;

    downloadSpeakerImage(speaker, $, imageLoaded);

    function imageLoaded(err, speaker) {
      done(null, speaker);
    }
  }
}

function downloadSpeakerImage(speaker, $, done) {
  var imagePath = $(".img-circle.wp-post-image").attr('src');
  if (!imagePath) {
    return done(null, speaker);
  }
  var fileName = path.basename(imagePath);
  speaker.profilePic = 'img/speakers/' + fileName;
  download(imagePath, fileName, function(err, data) {
    done(null, speaker);
  });
}

function joinParagraphs(paragraphs, $) {
  var lines = [];
  var items = paragraphs.each((i, p) => {
    var line = $(p).text();
    lines.push(line.trim());
  });
  var htmlLines = lines.map(function(line) {
    return "<p>" + line + "</p>";
  });
  return htmlLines.join("<br>");
}

function download(uri, filename, callback) {
  request(uri).pipe(fs.createWriteStream(imageFolderPath + filename)).on('close', callback);
}

function mapCompletedSessions(completedSessions) {
  var scheduleMap = {};
  var sessionsCopy = completedSessions;
  function mapNextSession() {
    var currentSession = sessionsCopy.pop();

    if (!currentSession) {
      return;
    }

    if (!scheduleMap[currentSession.date]) {
      scheduleMap[currentSession.date] = {
        groups: []
      };
    }

    var groupedSessions = sessionsCopy.filter(function(ses) {
      return ses.date === currentSession.date && ses.timeStart === currentSession.timeStart;
    });

    if (groupedSessions.length) {
      sessionsCopy = sessionsCopy.filter(function(item) {
        return groupedSessions.indexOf(item) === -1;
      });
    }
    groupedSessions.push(currentSession);
    scheduleMap[currentSession.date].groups.push({
      time: currentSession.timeStart,
      sessions: groupedSessions
    });

    mapNextSession();
  }

  mapNextSession();

  var result = {};
  var schedule = [];
  for (var key in scheduleMap) {
    if (scheduleMap.hasOwnProperty(key)) {
      schedule.push({
        date: key,
        groups: scheduleMap[key].groups
      })
    }
  }

  result.schedule = schedule;
  result.speakers = getSpeakers(completedSessions);
  console.log(util.inspect(result, false, null))
  fs.writeFile('output.json', JSON.stringify(result, null, 4));
}

function mapLocation(location) {
  var map = {
    "Ballroom": "ballroom",
    "Gala Room": "gala-room",
    "Boundary Room": "boundary-room",
    "TBD": "foyer",
    "foyer": "foyer"
  };
  var mappedLocation = map[location];
  if (!mappedLocation) {
    return "foyer";
  }
  return mappedLocation;
}

function getSpeakers(completedSessions) {
  return [].concat.apply([], completedSessions.map(function(session) {
    console.log(session);
    return session.speakers.map(function(speaker) {
      console.log(speaker)
      return speaker;
    });
  }));
}

loadschedule();
