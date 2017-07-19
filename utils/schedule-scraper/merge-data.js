const path = require('path');
const ncp = require('ncp').ncp;
const fs = require('fs');
const speakersPath = '../../www/img/speakers';
const dataPath = '../../www/data/data.json';
const jsonData = require(dataPath);
const newData = require("./output.json");

console.log('Copying speakers images');
ncp("downloads", speakersPath, function (err) {
  if (err) {
    return console.error(err);
  }
  console.log('Copying files complete.');
});

console.log('merging json data');
jsonData.speakers = newData.speakers;
jsonData.schedule = newData.schedule;
fs.writeFile(dataPath, JSON.stringify(jsonData, null, 4));

console.log('done');
