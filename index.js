"use strict";

require('dotenv').config()

var FeedParser = require('feedparser')
var request = require('request')

var express = require('express')
var app = express()

var compression = require('compression')
app.use(compression())

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/versions', (req, res) => {
  res.json(process.versions)
})

app.get('/ajax/services/feed/load', function(req, res) {
  var feed = req.query.q
  console.log(feed)
  var feed_req = request({
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

  feed_req.on('error', function (error) {
    console.log(`Request error:${error}`)
    res.status(502).send('Proxy error');
//    res.status(502);
//    res.render('error', { error: error });
  })

  feed_req.on('response', function (res) {
    if (res.statusCode !== 200) {
      this.emit('error', new Error(`Bad status code ${res.statusCode}`))
    }
    else {
      feed_req.pipe(feedparser)
    }
  })

  feedparser.on('error', function (error) {
    console.log(error)
  })

  feedparser.on('meta',  (m) => {
    meta = m
  })

  feedparser.on('readable', function () {
    var item
    while(item = this.read()) {
      item.publishedDate = item.pubDate
      item.content = item.description
      items.push(item)
    }
  })

  feedparser.on('end', () => {
    console.log({url: feed, entries: items.length})
    res.json({
      responseData: {
        feed: {
          feed : meta,
          entries : items
        }
      }
    })
  })
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
