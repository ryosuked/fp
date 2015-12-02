"use strict";

var FeedParser = require('feedparser')
var request = require('request')

var express = require('express')
var app = express()

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/ajax/services/feed/load', function(req, res) {
  var feed = req.query.q
  var feed_req = request(feed)
  var feedparser = new FeedParser({})

  var items = []
  var meta = {}

  feed_req.on('response', function (res) {
    feed_req.pipe(feedparser)
  });

  feedparser.on('meta',  (m) => {
    meta = m
  });

  feedparser.on('readable', function () {
    var item
    while(item = this.read()) {
      item.publishedDate = item.pubDate
      item.content = item.description
      items.push(item)
    }
  });

  feedparser.on('end', () => {
    res.json({
      responseData: {
        feed: {
          feed : meta,
          entries : items
        }
      }
    })
  });

})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
