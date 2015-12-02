"use strict";

var FeedParser = require('feedparser')
var request = require('request')
var feed = process.argv[2]

var req = request(feed)
var feedparser = new FeedParser({})

var items = []
var meta = {}

req.on('response', function (res) {
  req.pipe(feedparser)
});

feedparser.on('meta',  (m) => {
  meta = m
});

feedparser.on('readable', function () {
  var item
  while(item = this.read()) {
    items.push(item)
  }
});

feedparser.on('end', () => {
  console.log(JSON.stringify({
    feed : meta,
    entries : items
  }))
});
