"use strict";

require('dotenv').config()

const FeedParser = require('feedparser')
const request = require('request')
const express = require('express')
const app = express()
const compression = require('compression')

app.use(compression())
app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/versions', (req, res) => {
  res.json(process.versions)
})

app.get('/ajax/services/feed/load', function(req, res) {
  const feed_url = req.query.q
  console.log(feed_url)

  const feed_req = request({
    method: 'GET',
    url: feed_url,
    gzip: true,
    headers: {
      'User-Agent': 'request'
    }
  })

  feed_req.on('error', function (error) {
    console.log(`Request error:${error}`)
    res.status(502).send('Proxy error');
//    res.status(502);
//    res.render('error', { error: error });
  })

  const feedparser = new FeedParser({})

  feed_req.on('response', function (res) {
    if (res.statusCode !== 200) {
      this.emit('error', new Error(`Bad status code ${res.statusCode}`))
    }
    else {
      feed_req.pipe(feedparser)
    }
  })

  const items = []
  let meta = {}

  feedparser.on('error', function (error) {
    console.log(error)
  })

  feedparser.on('meta',  (m) => {
    meta = m
  })

  feedparser.on('readable', function () {
    let item
    while(item = this.read()) {
      item.publishedDate = item.pubDate
      item.content = item.description
      items.push(item)
    }
  })

  feedparser.on('end', () => {
    console.log({url: feed_url, entries: items.length})
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

app.listen(app.get('port'), () => {
  console.log("Node app is running at localhost:" + app.get('port'))
})
