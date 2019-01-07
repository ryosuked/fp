"use strict";

const FeedParser = require('feedparser')
const request = require('request')
const feed = process.argv[2]

const req = request.get({
  method: 'GET',
  url: feed,
  gzip: true,
  headers: {
    'User-Agent': 'request'
  }
})

const feedparser = new FeedParser({})

const items = []
let meta = {}

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
  let item
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
