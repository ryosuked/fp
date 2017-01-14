"use strict";

var FeedParser = require('feedparser')
var request = require('request')
var feed = process.argv[2]

var req = request.get({
  method: 'GET',
  url: feed,
  gzip: true,
  headers: {
    'User-Agent': 'request'
  }
})

var feedparser = new FeedParser({})

var items = []
var meta = {}

req.on('error', function (error) {
  console.log(`Request error:${error}`)
})

req.on('response', function (res) {
  console.log(req)
  if (res.statusCode !== 200) {
    this.emit('error', new Error(`Bad status code ${res.statusCode}`))
  }
  else {
    req.pipe(feedparser)
  }
})

feedparser.on('meta',  (m) => {
  meta = m
})

feedparser.on('readable', function () {
  var item
  while(item = this.read()) {
    items.push(item)
  }
})

feedparser.on('end', () => {
  console.log(JSON.stringify({
    feed : meta,
    entries : items
  }))
})
